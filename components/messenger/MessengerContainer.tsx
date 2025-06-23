"use client";

import { useState, useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr"; // 🔧 import dạng namespace
import { Avatar } from "@/components/ui/Avatar";
import { ScrollArea } from "@/components/ui/ScrollArea";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/formatTime";
import { callApi } from "@/lib/utils/api-client";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, MESSAGE_TYPE } from "@/lib/constants/enum";
import type { Message, SendMessageRequest } from "@/lib/models/message";
import type { MessengerPreview } from "@/lib/models/messenger_review";

interface Props {
  conversation: MessengerPreview;
  currentUserId: number;
  onClose: () => void;
}

export default function MessengerContainer({ conversation, currentUserId, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /* 1. Load lịch sử khi conversation thay đổi                           */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!conversation?.conversation_id) return;

    let abort = false;

    (async () => {
      try {
        const data = await callApi<Message[]>(API_ROUTES.MESSENGER.MESSAGES(conversation.conversation_id ?? 0), HTTP_METHOD_ENUM.GET);
        if (!abort) setMessages(data);
      } catch (err) {
        console.error("Lỗi tải tin nhắn:", err);
      }
    })();

    return () => {
      abort = true;
    };
  }, [conversation?.conversation_id]);

  /* ------------------------------------------------------------------ */
  /* 2. Kết nối SignalR chỉ 1 lần                                       */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    debugger;
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/chathub`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    conn.on("ReceiveMessage", (m: SendMessageRequest) => {
      if (
        m.targetId === conversation.conversation_id || // bạn là người nhận
        m.senderId === conversation.conversation_id // bạn là người gửi
      ) {
        setMessages((list) => [...list, m]);
      }
    });
    conn.start().catch(console.error);

    return () => {
      conn.stop();
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* 3. Auto-scroll                                                     */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ------------------------------------------------------------------ */
  /* 4. Gửi tin nhắn                                                    */
  /* ------------------------------------------------------------------ */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const body: SendMessageRequest = {
      senderId: currentUserId,
      content: input.trim(),
      messageType: MESSAGE_TYPE.PRIVATE,
      targetId: conversation.conversation_id,
    };

    try {
      // Gọi ChatServer – API chỉ trả status, không cần push thủ công
      await callApi(API_ROUTES.CHAT_SERVER.SENT_MESSAGE, HTTP_METHOD_ENUM.POST, body);
      setInput("");
    } catch (err) {
      console.error("Gửi tin nhắn thất bại:", err);
    }
  };

  /* ------------------------------------------------------------------ */
  /* 5. UI                                                              */
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
          ✖
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 space-y-2 overflow-y-auto px-4 py-3 max-h-[400px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[80%] break-words rounded-lg px-4 py-2 text-sm shadow",
              msg.sender_id === currentUserId ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted text-foreground"
            )}
          >
            <p>{msg.content}</p>
            <p className="text-[10px] text-right text-muted-foreground">{formatTime(msg.created_at)}</p>
          </div>
        ))}
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
