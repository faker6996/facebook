"use client";

import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { Avatar } from "@/components/ui/Avatar";
import { ScrollArea } from "@/components/ui/ScrollArea";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/formatTime";
import { callApi } from "@/lib/utils/api-client";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, MESSAGE_TYPE } from "@/lib/constants/enum";
import { Message, MessageStatus, SendMessageRequest } from "@/lib/models/message";
import type { MessengerPreview } from "@/lib/models/messenger_review";
import { User } from "@/lib/models/user";
import { loadFromLocalStorage } from "@/lib/utils/local-storage";
import { MessageStatusIcon } from "@/components/icons/MessageStatusIcon";
// ✨ 1. Import component icon bạn đã tạo

interface Props {
  conversation: MessengerPreview;
  onClose: () => void;
}

export default function MessengerContainer({ conversation, onClose }: Props) {
  const [sender, setSender] = useState<User>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /* 1. Load lịch sử khi conversation thay đổi                           */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!conversation?.conversation_id) return;
    const sender = loadFromLocalStorage("user", User);
    setSender(sender ?? {});
    let isMounted = true;
    (async () => {
      try {
        const response = await callApi<Message[]>(API_ROUTES.MESSENGER.MESSAGES(conversation.conversation_id ?? 0), HTTP_METHOD_ENUM.GET);
        // Chuyển đổi data thô thành instance của class Message
        const messageInstances = response?.map((msgData) => new Message(msgData));
        if (isMounted) setMessages(messageInstances);
      } catch (err) {
        console.error("Lỗi tải tin nhắn:", err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [conversation?.conversation_id]);

  /* ------------------------------------------------------------------ */
  /* 2. Kết nối và xử lý SignalR                                       */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!sender?.id || !conversation?.other_user_id) return;
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/chathub`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    conn.on("ReceiveMessage", (newMessageData: any) => {
      // Dùng any để nhận mọi cấu trúc
      console.log("Đã nhận tin nhắn từ SignalR:", newMessageData);

      // ✨ Chuẩn hóa dữ liệu từ SignalR về dạng snake_case mà code đang dùng
      const normalizedMessage = new Message({
        id: newMessageData.id,
        content: newMessageData.content,
        created_at: newMessageData.created_at || newMessageData.timestamp,
        message_type: newMessageData.message_type || newMessageData.messageType,
        sender_id: newMessageData.sender_id || newMessageData.senderId,
        target_id: newMessageData.target_id || newMessageData.targetId,
        status: "sent",
      });

      const isMessageForCurrentConversation =
        (normalizedMessage.sender_id === conversation.other_user_id && normalizedMessage.target_id === sender.id) ||
        (normalizedMessage.sender_id === sender.id && normalizedMessage.target_id === conversation.other_user_id);

      if (isMessageForCurrentConversation) {
        console.log("Tin nhắn thuộc cuộc hội thoại này, cập nhật UI...");
        setMessages((prevMessages) => [...prevMessages, normalizedMessage]);
      } else {
        console.log("Tin nhắn từ cuộc hội thoại khác, bỏ qua.");
      }
    });

    conn.start().catch((err) => console.error("Kết nối SignalR thất bại: ", err));
    return () => {
      conn.stop();
    };
  }, [sender.id, conversation.other_user_id]);
  /* ------------------------------------------------------------------ */
  /* 3. Auto-scroll                                                     */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ------------------------------------------------------------------ */
  /* 4. Gửi và Thử lại tin nhắn                                          */
  /* ------------------------------------------------------------------ */
  const performSendMessage = async (content: string, tempId: string) => {
    const body: SendMessageRequest = {
      sender_id: sender.id!,
      content: content,
      message_type: MESSAGE_TYPE.PRIVATE,
      target_id: conversation.other_user_id,
    };

    try {
      const response = await callApi<{ data: Message }>(
        `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}${API_ROUTES.MESSENGER.SEND_MESSAGE}`,
        HTTP_METHOD_ENUM.POST,
        body
      );
      const savedMessage = new Message(response.data);
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? savedMessage : msg)));
    } catch (err) {
      console.error("Gửi tin nhắn thất bại:", err);
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? new Message({ ...msg, status: "failed" }) : msg)));
    }
  };

  const sendMessage = () => {
    debugger;
    if (!input.trim() || !sender.id) return;
    const temporaryId = `temp_${Date.now()}`;
    const content = input.trim();
    const optimisticMessage = new Message({
      id: temporaryId,
      sender_id: sender.id,
      target_id: conversation.other_user_id,
      content: content,
      message_type: "text",
      created_at: new Date().toISOString(),
      status: "sending",
    });
    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    performSendMessage(content, temporaryId);
  };

  // ✨ 2. Thêm hàm xử lý gửi lại tin nhắn
  const handleRetrySend = (failedMessage: Message) => {
    if (!failedMessage.content) return;

    // Xóa tin nhắn lỗi khỏi danh sách
    setMessages((prev) => prev.filter((m) => m.id !== failedMessage.id));

    // Thực hiện gửi lại
    const temporaryId = `temp_${Date.now()}`;
    const optimisticMessage = new Message({
      ...failedMessage,
      id: temporaryId,
      status: "sending",
      created_at: new Date().toISOString(),
    });
    setMessages((prev) => [...prev, optimisticMessage]);
    performSendMessage(failedMessage.content, temporaryId);
  };

  /* ------------------------------------------------------------------ */
  /* 5. UI - Giao diện đã được làm đẹp                                   */
  /* ------------------------------------------------------------------ */
  return (
    <div className="fixed bottom-4 right-4 z-40 flex w-full max-w-md flex-col overflow-hidden rounded-xl border bg-card shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b bg-muted px-4 py-3">
        <div className="flex items-center gap-2">
          <Avatar src={conversation.avatar_url ?? "/avatar.png"} size="sm" />
          <div>
            <p className="text-sm font-semibold">{conversation.other_user_name}</p>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </Button>
      </div>

      {/* ✨ 3. Khu vực hiển thị tin nhắn đã được thay thế hoàn toàn */}
      <ScrollArea className="flex-1 space-y-2 overflow-y-auto p-4 max-h-[400px]">
        {messages.map((msg) => {
          const isSender = msg.sender_id === sender.id;
          return (
            <div
              key={msg.id}
              className={cn(
                "max-w-[80%] w-fit break-words rounded-xl px-3 py-2 text-sm shadow-md flex flex-col",
                isSender ? "ml-auto bg-blue-600 text-white" : "mr-auto bg-gray-200 text-gray-800",
                msg.status === "failed" && "bg-red-200 text-red-800 opacity-90"
              )}
            >
              <p className="text-pretty">{msg.content}</p>
              <div className="flex items-center self-end mt-1.5 gap-2">
                {msg.status === "failed" ? (
                  <>
                    <span className="text-xs font-semibold">Gửi lỗi</span>
                    <button onClick={() => handleRetrySend(msg)} className="text-xs font-bold hover:underline">
                      Thử lại
                    </button>
                  </>
                ) : (
                  <>
                    <p className={cn("text-[11px]", isSender ? "text-white/70" : "text-gray-500")}>{formatTime(msg.created_at)}</p>
                    {isSender && (
                      <MessageStatusIcon
                        status={msg.status}
                        className={cn("size-4", isSender ? "text-white/80" : "text-gray-500", msg.status === "read" && "!text-cyan-300")}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </ScrollArea>

      {/* Input */}
      <div className="flex gap-2 border-t bg-muted p-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Nhập tin nhắn..."
        />
        <Button onClick={sendMessage}>Gửi</Button>
      </div>
    </div>
  );
}
