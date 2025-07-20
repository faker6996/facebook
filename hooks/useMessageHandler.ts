"use client";

import { useState, useCallback } from 'react';
import { Message, SendMessageRequest, AddReactionRequest, RemoveReactionRequest } from "@/lib/models/message";
import { MessengerPreview } from "@/lib/models/messenger_review";
import { User } from "@/lib/models/user";
import { callApi } from "@/lib/utils/api-client";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, MESSAGE_TYPE } from "@/lib/constants/enum";

interface UseMessageHandlerProps {
  conversation: MessengerPreview;
  sender: User;
  onScrollToBottom: (delay?: number, reason?: string) => void;
  onSetShouldAutoScroll: (should: boolean) => void;
}

export const useMessageHandler = ({
  conversation,
  sender,
  onScrollToBottom,
  onSetShouldAutoScroll
}: UseMessageHandlerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const isGroup = conversation.is_group === true;

  // Upload files
  const uploadFiles = useCallback(async (files: File[]) => {
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
          console.error("Upload error:", response.status, errorText);
          throw new Error(`Failed to upload ${file.name}: ${response.status}`);
        }

        const result = await response.json();
        console.log("Upload response:", result);
        console.log("Upload response data:", result.data);

        // Xử lý format response từ chat server
        return {
          file_name: result.data?.file_name || result.file_name || result.name || file.name,
          file_url: result.data?.file_url || result.file_url || result.url,
          file_type: result.data?.file_type || result.file_type || result.type || file.type,
          file_size: result.data?.file_size || result.file_size || result.size || file.size,
        };
      } catch (error) {
        console.error("Upload file error:", error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  }, []);

  // Gửi tin nhắn
  const performSendMessage = useCallback(async (
    content: string,
    tempId: string,
    attachments?: any[],
    contentType?: "text" | "image" | "file",
    replyToMessageId?: number
  ) => {
    const body: SendMessageRequest = {
      sender_id: sender.id!,
      content,
      message_type: isGroup ? MESSAGE_TYPE.GROUP : MESSAGE_TYPE.PRIVATE,
      content_type: contentType || "text",
      target_id: isGroup ? undefined : conversation.other_user_id,
      reply_to_message_id: replyToMessageId,
      attachments,
    };

    // Chỉ thêm conversation_id nếu có
    if (conversation.conversation_id) {
      body.conversation_id = conversation.conversation_id;
    }

    console.log("Sending message:", body);
    console.log("Attachments detail:", JSON.stringify(attachments, null, 2));

    try {
      const res = await callApi<Message>(
        API_ROUTES.CHAT_SERVER.SENT_MESSAGE, 
        HTTP_METHOD_ENUM.POST, 
        body, 
        { silent: true } // Disable global loading for send message
      );
      console.log("✅ Message sent successfully:", res);

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === tempId) {
            // Preserve replied_message from optimistic if server doesn't return it
            const serverMessage = new Message(res);
            if (!serverMessage.replied_message && m.replied_message) {
              console.log("📨 Preserving replied_message from optimistic update");
              serverMessage.replied_message = m.replied_message;
            }
            return serverMessage;
          }
          return m;
        })
      );
    } catch (err) {
      console.error("Send message error:", err);
      console.error("Request body was:", body);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? new Message({ ...m, status: "Failed" }) : m)));
    }
  }, [conversation, sender, isGroup]);

  const sendMessage = useCallback(async (
    input: string,
    selectedFiles: File[],
    setInput: (value: string) => void,
    setSelectedFiles: (files: File[]) => void,
    setIsUploading: (loading: boolean) => void
  ) => {
    if ((!input.trim() && selectedFiles.length === 0) || !sender.id) return;

    setIsUploading(true);
    const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
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
      if (firstAttachment.file_type?.startsWith("image/")) {
        contentType = "image";
      } else {
        contentType = "file";
      }
    }

    const optimistic = new Message({
      id: tempId,
      sender_id: sender.id,
      target_id: conversation.other_user_id,
      content,
      message_type: isGroup ? MESSAGE_TYPE.GROUP : MESSAGE_TYPE.PRIVATE,
      content_type: contentType,
      reply_to_message_id: typeof replyingTo?.id === "number" ? replyingTo.id : undefined,
      replied_message: replyingTo
        ? {
            id: replyingTo.id,
            content: replyingTo.content,
            sender_id: replyingTo.sender_id,
            content_type: replyingTo.content_type,
            created_at: replyingTo.created_at,
          }
        : undefined,
      created_at: new Date().toISOString(),
      status: "Sending",
      attachments: attachments.map((att, index) => ({ ...att, id: `att_${Date.now()}_${index}` })),
    });

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSelectedFiles([]);
    setReplyingTo(null);
    setIsUploading(false);
    
    // Cuộn xuống cuối sau khi gửi tin nhắn (user luôn muốn thấy tin nhắn của mình)
    onSetShouldAutoScroll(true);
    onScrollToBottom(50, 'send-message');
    
    performSendMessage(content, tempId, attachments, contentType, typeof replyingTo?.id === "number" ? replyingTo.id : undefined);
  }, [conversation, sender, isGroup, replyingTo, uploadFiles, performSendMessage, onScrollToBottom, onSetShouldAutoScroll]);

  const handleRetrySend = useCallback((failed: Message) => {
    if (!failed.content) return;
    setMessages((prev) => prev.filter((m) => m.id !== failed.id));
    const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const optimistic = new Message({
      ...failed,
      id: tempId,
      status: "Sending",
      created_at: new Date().toISOString(),
    });
    setMessages((prev) => [...prev, optimistic]);
    performSendMessage(failed.content, tempId, failed.attachments, failed.content_type, failed.reply_to_message_id);
  }, [performSendMessage]);

  const handleReplyMessage = useCallback((message: Message) => {
    setReplyingTo(message);
  }, []);

  const handleAddReaction = useCallback(async (messageId: number, emoji: string) => {
    if (!sender.id) return;

    // Optimistic update for immediate UI feedback
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const newReactions = [...(msg.reactions || [])];

          // Check if user already reacted with this emoji
          const existingIndex = newReactions.findIndex((r) => r.user_id === sender.id && r.emoji === emoji);

          if (existingIndex === -1) {
            // Add new reaction optimistically
            newReactions.push({
              id: Date.now() + Math.floor(Math.random() * 1000), // temporary ID
              message_id: messageId,
              user_id: sender.id!,
              emoji,
              reacted_at: new Date().toISOString(),
            });
          }

          return new Message({ ...msg, reactions: newReactions });
        }
        return msg;
      })
    );

    const body: AddReactionRequest = {
      message_id: messageId,
      user_id: sender.id,
      emoji,
    };

    try {
      console.log("🎭 Adding reaction:", body);
      await callApi(`${API_ROUTES.CHAT_SERVER.ADD_REACTION}`, HTTP_METHOD_ENUM.POST, body);
      // Chat server sẽ broadcast ReceiveReaction event
    } catch (error) {
      console.error("❌ Add reaction error:", error);
      // Revert optimistic update on error
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const newReactions = (msg.reactions || []).filter((r) => !(r.user_id === sender.id && r.emoji === emoji));
            return new Message({ ...msg, reactions: newReactions });
          }
          return msg;
        })
      );
    }
  }, [sender]);

  const handleRemoveReaction = useCallback(async (messageId: number, emoji: string) => {
    if (!sender.id) return;

    // Store the removed reaction for potential rollback
    let removedReaction: any = null;

    // Optimistic update for immediate UI feedback
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const newReactions = (msg.reactions || []).filter((r) => {
            const shouldRemove = r.user_id === sender.id && r.emoji === emoji;
            if (shouldRemove) {
              removedReaction = r; // Store for rollback
            }
            return !shouldRemove;
          });

          return new Message({ ...msg, reactions: newReactions });
        }
        return msg;
      })
    );

    const body: RemoveReactionRequest = {
      message_id: messageId,
      user_id: sender.id,
      emoji,
    };

    try {
      console.log("🎭 Removing reaction:", body);
      await callApi(`${API_ROUTES.CHAT_SERVER.REMOVE_REACTION}`, HTTP_METHOD_ENUM.POST, body);
      // Chat server sẽ broadcast RemoveReaction event
    } catch (error) {
      console.error("❌ Remove reaction error:", error);
      // Revert optimistic update on error
      if (removedReaction) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              const newReactions = [...(msg.reactions || []), removedReaction];
              return new Message({ ...msg, reactions: newReactions });
            }
            return msg;
          })
        );
      }
    }
  }, [sender]);

  return {
    messages,
    setMessages,
    replyingTo,
    setReplyingTo,
    sendMessage,
    handleRetrySend,
    handleReplyMessage,
    handleAddReaction,
    handleRemoveReaction,
    uploadFiles
  };
};