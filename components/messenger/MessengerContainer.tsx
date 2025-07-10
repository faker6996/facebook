"use client";

// ----- Imports -----
import React, { useEffect, useRef, useState } from "react";

// Local Imports
import { X } from "lucide-react";
import MessageList from "@/components/messenger/MessageList";
import MessageInput from "@/components/messenger/MessageInput";
import { useSignalRConnection } from "@/components/messenger/useSignalRConnection";
import { Avatar } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, MESSAGE_TYPE } from "@/lib/constants/enum";
import { Message, SendMessageRequest, AddReactionRequest, RemoveReactionRequest } from "@/lib/models/message";
import type { MessengerPreview } from "@/lib/models/messenger_review";
import { User } from "@/lib/models/user";
import { callApi } from "@/lib/utils/api-client";
import { loadFromLocalStorage } from "@/lib/utils/local-storage";
import { cn } from "@/lib/utils/cn";

// ----- Props Interface -----
interface Props {
  conversation: MessengerPreview;
  onClose: (conversationId: number) => void;
  style?: React.CSSProperties;
}

// ----- Component Definition -----
export default function MessengerContainer({ conversation, onClose, style }: Props) {
  // ----- State cho Chat -----
  const [sender, setSender] = useState<User>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const [isOtherUserOnline, setIsOtherUserOnline] = useState(conversation.other_is_online);

  // SignalR Connection
  useSignalRConnection({
    sender,
    conversation,
    messages,
    setMessages,
    setIsOtherUserOnline
  });

  // ----- useEffect Hooks -----
  // Load tin nhắn ban đầu
  useEffect(() => {
    if (!conversation?.conversation_id) return;
    const currentUser = loadFromLocalStorage("user", User);
    setSender(currentUser ?? {});

    let isMounted = true;
    (async () => {
      try {
        console.log('🔥 Loading messages for conversation:', conversation.conversation_id);
        const response = await callApi<Message[]>(API_ROUTES.MESSENGER.MESSAGES(conversation.conversation_id ?? 0), HTTP_METHOD_ENUM.GET);
        console.log('✅ Raw API Response:', response);
        console.log('✅ Messages loaded successfully:', response?.length);
        
        if (isMounted) {
          console.log('🔄 Mapping response to Message objects...');
          const mappedMessages = response?.map((m, index) => {
            console.log(`📝 Processing message ${index}:`, m);
            try {
              return new Message(m);
            } catch (err) {
              console.error(`❌ Error processing message ${index}:`, err, m);
              return null;
            }
          }).filter((m): m is Message => m !== null) ?? [];
          
          console.log('🎯 Final mapped messages:', mappedMessages.length);
          setMessages(mappedMessages);
        }
      } catch (err) {
        console.error("❌ Lỗi tải tin nhắn:", err);
        console.error("❌ Error details:", {
          conversationId: conversation.conversation_id,
          error: err
        });
      }
    })();

    // Cập nhật lại trạng thái khi conversation thay đổi
    setIsOtherUserOnline(conversation.other_is_online);

    return () => {
      isMounted = false;
    };
  }, [conversation]);


  // Cuộn xuống cuối
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Upload files
  const uploadFiles = async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        const response = await fetch(API_ROUTES.CHAT_SERVER.UPLOAD_FILE, {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Upload error:', response.status, errorText);
          throw new Error(`Failed to upload ${file.name}: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Upload response:', result);
        console.log('Upload response data:', result.data);
        
        // Xử lý format response từ chat server
        return {
          file_name: result.data?.file_name || result.file_name || result.name || file.name,
          file_url: result.data?.file_url || result.file_url || result.url,
          file_type: result.data?.file_type || result.file_type || result.type || file.type,
          file_size: result.data?.file_size || result.file_size || result.size || file.size,
        };
      } catch (error) {
        console.error('Upload file error:', error);
        throw error;
      }
    });
    
    return Promise.all(uploadPromises);
  };

  // Gửi tin nhắn
  const performSendMessage = async (content: string, tempId: string, attachments?: any[], contentType?: "text" | "image" | "file", replyToMessageId?: number) => {
    const body: SendMessageRequest = {
      sender_id: sender.id!,
      content,
      conversation_id: conversation.conversation_id!,
      message_type: MESSAGE_TYPE.PRIVATE, // Loại tin nhắn (PRIVATE/PUBLIC/GROUP)
      content_type: contentType || "text", // Loại nội dung (text/image/file)
      target_id: conversation.other_user_id,
      reply_to_message_id: replyToMessageId,
      attachments,
    };

    console.log('Sending message:', body);
    console.log('Attachments detail:', JSON.stringify(attachments, null, 2));

    try {
      const res = await callApi<Message>(API_ROUTES.CHAT_SERVER.SENT_MESSAGE, HTTP_METHOD_ENUM.POST, body);
      console.log('✅ Message sent successfully:', res);
      
      setMessages((prev) => prev.map((m) => {
        if (m.id === tempId) {
          // Preserve replied_message from optimistic if server doesn't return it
          const serverMessage = new Message(res);
          if (!serverMessage.replied_message && m.replied_message) {
            console.log('📨 Preserving replied_message from optimistic update');
            serverMessage.replied_message = m.replied_message;
          }
          return serverMessage;
        }
        return m;
      }));
    } catch (err) {
      console.error("Send message error:", err);
      console.error("Request body was:", body);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? new Message({ ...m, status: "Failed" }) : m)));
    }
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && selectedFiles.length === 0) || !sender.id) return;

    setIsUploading(true);
    const tempId = `temp_${Date.now()}`;
    const content = input.trim();
    
    let attachments: any[] = [];
    if (selectedFiles.length > 0) {
      try {
        attachments = await uploadFiles(selectedFiles);
      } catch (error) {
        console.error("File upload failed:", error);
        setIsUploading(false);
        return;
      }
    }

    // Xác định content_type dựa trên input gửi đi
    let contentType: "text" | "image" | "file" = "text";
    
    if (attachments && attachments.length > 0) {
      // Nếu có attachment, check loại file
      const firstAttachment = attachments[0];
      if (firstAttachment.file_type?.startsWith('image/')) {
        contentType = "image";
      } else {
        contentType = "file";
      }
    }
    // Nếu chỉ có text mà không có attachment thì vẫn là "text"

    const optimistic = new Message({
      id: tempId,
      sender_id: sender.id,
      target_id: conversation.other_user_id,
      content,
      message_type: MESSAGE_TYPE.PRIVATE, // Loại tin nhắn (PRIVATE/PUBLIC/GROUP)
      content_type: contentType, // Loại nội dung (text/image/file)
      reply_to_message_id: typeof replyingTo?.id === 'number' ? replyingTo.id : undefined,
      replied_message: replyingTo ? {
        id: replyingTo.id,
        content: replyingTo.content,
        sender_id: replyingTo.sender_id,
        content_type: replyingTo.content_type,
        created_at: replyingTo.created_at
      } : undefined,
      created_at: new Date().toISOString(),
      status: "Sending",
      attachments: attachments.map(att => ({ ...att, id: Math.random() })),
    });

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSelectedFiles([]);
    setReplyingTo(null);
    setIsUploading(false);
    performSendMessage(content, tempId, attachments, contentType, typeof replyingTo?.id === 'number' ? replyingTo.id : undefined);
  };

  const handleRetrySend = (failed: Message) => {
    if (!failed.content) return;
    setMessages((prev) => prev.filter((m) => m.id !== failed.id));
    const tempId = `temp_${Date.now()}`;
    const optimistic = new Message({
      ...failed,
      id: tempId,
      status: "Sending",
      created_at: new Date().toISOString(),
    });
    setMessages((prev) => [...prev, optimistic]);
    performSendMessage(failed.content, tempId, failed.attachments, failed.content_type, failed.reply_to_message_id);
  };

  const handleReplyMessage = (message: Message) => {
    setReplyingTo(message);
    // Auto focus vào input khi reply
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };

  const handleAddReaction = async (messageId: number, emoji: string) => {
    if (!sender.id) return;
    
    // Optimistic update for immediate UI feedback
    setMessages((prev) => prev.map(msg => {
      if (msg.id === messageId) {
        const newReactions = [...(msg.reactions || [])];
        
        // Check if user already reacted with this emoji
        const existingIndex = newReactions.findIndex(r => 
          r.user_id === sender.id && r.emoji === emoji
        );
        
        if (existingIndex === -1) {
          // Add new reaction optimistically
          newReactions.push({
            id: Math.random(), // temporary ID
            message_id: messageId,
            user_id: sender.id!,
            emoji,
            reacted_at: new Date().toISOString()
          });
        }
        
        return new Message({ ...msg, reactions: newReactions });
      }
      return msg;
    }));
    
    const body: AddReactionRequest = {
      message_id: messageId,
      user_id: sender.id,
      emoji
    };

    try {
      console.log('🎭 Adding reaction:', body);
      await callApi(`${API_ROUTES.CHAT_SERVER.ADD_REACTION}`, HTTP_METHOD_ENUM.POST, body);
      // Chat server sẽ broadcast ReceiveReaction event
    } catch (error) {
      console.error('❌ Add reaction error:', error);
      // Revert optimistic update on error
      setMessages((prev) => prev.map(msg => {
        if (msg.id === messageId) {
          const newReactions = (msg.reactions || []).filter(r => 
            !(r.user_id === sender.id && r.emoji === emoji)
          );
          return new Message({ ...msg, reactions: newReactions });
        }
        return msg;
      }));
    }
  };

  const handleRemoveReaction = async (messageId: number, emoji: string) => {
    if (!sender.id) return;
    
    // Store the removed reaction for potential rollback
    let removedReaction: any = null;
    
    // Optimistic update for immediate UI feedback
    setMessages((prev) => prev.map(msg => {
      if (msg.id === messageId) {
        const newReactions = (msg.reactions || []).filter(r => {
          const shouldRemove = r.user_id === sender.id && r.emoji === emoji;
          if (shouldRemove) {
            removedReaction = r; // Store for rollback
          }
          return !shouldRemove;
        });
        
        return new Message({ ...msg, reactions: newReactions });
      }
      return msg;
    }));
    
    const body: RemoveReactionRequest = {
      message_id: messageId,
      user_id: sender.id,
      emoji
    };

    try {
      console.log('🎭 Removing reaction:', body);
      await callApi(`${API_ROUTES.CHAT_SERVER.REMOVE_REACTION}`, HTTP_METHOD_ENUM.POST, body);
      // Chat server sẽ broadcast RemoveReaction event
    } catch (error) {
      console.error('❌ Remove reaction error:', error);
      // Revert optimistic update on error
      if (removedReaction) {
        setMessages((prev) => prev.map(msg => {
          if (msg.id === messageId) {
            const newReactions = [...(msg.reactions || []), removedReaction];
            return new Message({ ...msg, reactions: newReactions });
          }
          return msg;
        }));
      }
    }
  };


  // ----- JSX Render -----
  return (
    <>
      <div
        // Căn sang góc dưới bên phải, giảm chiều cao tối đa và thêm hiệu ứng chuyển động
        className="fixed bottom-4 right-4 z-40 flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl transition-all duration-300 ease-soft max-h-[500px]"
        style={style}
      >
        {/* Header: Thêm padding và làm cho avatar nổi bật hơn */}
        <div className="flex items-center justify-between gap-3 border-b bg-card p-3">
          <div className="flex items-center gap-3">
            {/* Avatar với chỉ báo trạng thái hoạt động */}
            <div className="relative flex-shrink-0">
              <Avatar src={conversation.avatar_url ?? "/avatar.png"} size="md" />
              {/* CẬP NHẬT: Đổi màu chấm trạng thái dựa trên state */}
              <span
                className={cn(
                  "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-card",
                  isOtherUserOnline ? "bg-success" : "bg-gray-400"
                )}
              />
            </div>
            <div>
              <p className="font-semibold">{conversation.other_user_name}</p>
              <p className="text-xs text-muted-foreground">{isOtherUserOnline ? "Online" : "Offline"}</p>
            </div>
          </div>
          <div className="flex items-center">
            {/* Có thể thêm các nút khác ở đây trong tương lai, ví dụ: gọi điện, thông tin */}
            <Button size="icon" variant="ghost" onClick={() => onClose(conversation.conversation_id!)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Message list: Giảm khoảng cách giữa các tin nhắn xuống space-y-2 */}
        <ScrollArea className="flex-1 space-y-2 bg-background/50 p-4">
          <MessageList 
            messages={messages} 
            senderId={sender.id} 
            onRetrySend={handleRetrySend} 
            onReplyMessage={handleReplyMessage}
            onAddReaction={handleAddReaction}
            onRemoveReaction={handleRemoveReaction}
          />
          <div ref={bottomRef} />
        </ScrollArea>

        {/* Message Input */}
        <MessageInput
          ref={messageInputRef}
          input={input}
          setInput={setInput}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          isUploading={isUploading}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          onSendMessage={sendMessage}
        />
      </div>
    </>
  );
}
