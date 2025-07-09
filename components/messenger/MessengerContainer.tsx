"use client";

// ----- Imports -----
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";

// Local Imports
import { SendHorizontal, X, Paperclip, Image, FileText } from "lucide-react";
import MessageList from "@/components/messenger/MessageList";
import { Avatar } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, MESSAGE_TYPE } from "@/lib/constants/enum";
import { Message, SendMessageRequest } from "@/lib/models/message";
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOtherUserOnline, setIsOtherUserOnline] = useState(conversation.other_is_online);

  // ----- useEffect Hooks -----
  // Load tin nhắn ban đầu
  useEffect(() => {
    if (!conversation?.conversation_id) return;
    const currentUser = loadFromLocalStorage("user", User);
    setSender(currentUser ?? {});

    let isMounted = true;
    (async () => {
      try {
        const response = await callApi<Message[]>(API_ROUTES.MESSENGER.MESSAGES(conversation.conversation_id ?? 0), HTTP_METHOD_ENUM.GET);
        if (isMounted) setMessages(response?.map((m) => new Message(m)) ?? []);
      } catch (err) {
        console.error("Lỗi tải tin nhắn:", err);
      }
    })();

    // Cập nhật lại trạng thái khi conversation thay đổi
    setIsOtherUserOnline(conversation.other_is_online);

    return () => {
      isMounted = false;
    };
  }, [conversation]);

  // Thiết lập SignalR cho Chat
  useEffect(() => {
    if (!sender?.id || !conversation?.other_user_id) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/chathub`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    // Lắng nghe tin nhắn mới
    conn.on("ReceiveMessage", (newMsg: any) => {
      const isForCurrent =
        (newMsg.sender_id === conversation.other_user_id && newMsg.target_id === sender.id) ||
        (newMsg.sender_id === sender.id && newMsg.target_id === conversation.other_user_id);
      if (isForCurrent) {
        setMessages((prev) => [...prev, new Message(newMsg)]);
      }
    });

    // THÊM MỚI: Lắng nghe sự kiện trạng thái
    conn.on("UserOnline", (userId: string) => {
      // So sánh string với number cần cẩn thận
      if (userId == conversation.other_user_id?.toString()) {
        console.log(`User ${userId} is now ONLINE.`);
        setIsOtherUserOnline(true);
      }
    });

    conn.on("UserOffline", (userId: string) => {
      if (userId == conversation.other_user_id?.toString()) {
        console.log(`User ${userId} is now OFFLINE.`);
        setIsOtherUserOnline(false);
      }
    });

    // Đồng bộ tin nhắn khi kết nối lại
    conn.onreconnected(async (connectionId) => {
      console.log(`✅ SignalR reconnected: ${connectionId}`);
      const lastId =
        messages
          .slice()
          .reverse()
          .find((m) => typeof m.id === "number")?.id ?? 0;
      try {
        const missed = await callApi<Message[]>(
          `${API_ROUTES.MESSENGER.SYNC}?conversationId=${conversation.conversation_id}&lastMessageId=${lastId}`,
          HTTP_METHOD_ENUM.GET
        );
        if (missed?.length) {
          const inst = missed.map((m) => new Message(m));
          setMessages((prev) => [...prev, ...inst].sort((a, b) => new Date(a.created_at ?? "").getTime() - new Date(b.created_at ?? "").getTime()));
        }
      } catch (err) {
        console.error("Sync fail:", err);
      }
    });

    conn.start().catch((err) => console.error("SignalR connect fail", err));

    // Dọn dẹp kết nối khi component unmount
    return () => {
      conn.stop();
    };
  }, [sender.id, conversation.other_user_id, messages]); // Thêm 'messages' để lấy lastId chính xác khi reconnected

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
  const performSendMessage = async (content: string, tempId: string, attachments?: any[], contentType?: "text" | "image" | "file") => {
    const body: SendMessageRequest = {
      sender_id: sender.id!,
      content,
      conversation_id: conversation.conversation_id!,
      message_type: MESSAGE_TYPE.PRIVATE, // Loại tin nhắn (PRIVATE/PUBLIC/GROUP)
      content_type: contentType || "text", // Loại nội dung (text/image/file)
      target_id: conversation.other_user_id,
      attachments,
    };

    console.log('Sending message:', body);
    console.log('Attachments detail:', JSON.stringify(attachments, null, 2));

    try {
      const res = await callApi<Message>(API_ROUTES.CHAT_SERVER.SENT_MESSAGE, HTTP_METHOD_ENUM.POST, body);
      const saved = new Message(res);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
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
      created_at: new Date().toISOString(),
      status: "Sending",
      attachments: attachments.map(att => ({ ...att, id: Math.random() })),
    });

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSelectedFiles([]);
    setIsUploading(false);
    performSendMessage(content, tempId, attachments, contentType);
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
    performSendMessage(failed.content, tempId, failed.attachments);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <MessageList messages={messages} senderId={sender.id} onRetrySend={handleRetrySend} />
          <div ref={bottomRef} />
        </ScrollArea>

        {/* Input Form: Thiết kế lại hoàn toàn để trông hiện đại hơn */}
        <div className="border-t bg-card p-3">
          {/* Hiển thị files đã chọn */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 rounded-lg bg-muted p-2">
                  {getFileIcon(file.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={sendMessage} className="flex items-center gap-2">
            {/* Nút đính kèm file */}
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              className="flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </Button>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,application/pdf,.doc,.docx,.txt,.xls,.xlsx"
            />

            {/* Bọc Input trong một div để tạo hiệu ứng bo tròn */}
            <div className="relative w-full">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                // Kiểu dáng bo tròn, có padding
                className="w-full rounded-full border bg-muted py-2 pl-4 pr-10 focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            {/* Nút gửi */}
            <Button 
              type="submit" 
              size="icon" 
              variant="ghost" 
              className="flex-shrink-0" 
              disabled={(!input.trim() && selectedFiles.length === 0) || isUploading}
            >
              <SendHorizontal className={`h-5 w-5 transition-colors ${(input.trim() || selectedFiles.length > 0) && !isUploading ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
