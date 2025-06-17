import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Message } from "@/lib/models/message";
import { MessengerPreview } from "@/lib/models/messenger_review";
import { callApi } from "@/lib/utils/api-client";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { formatTime } from "@/lib/utils/formatTime";

interface MessengerContainerProps {
  conversation: MessengerPreview;
  currentUserId: number;
  onClose: () => void;
}

export default function MessengerContainer({ conversation, currentUserId, onClose }: MessengerContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!conversation?.conversation_id) return;
      try {
        const data = await callApi<Message[]>(API_ROUTES.MESSENGER.MESSAGES(conversation.conversation_id), HTTP_METHOD_ENUM.GET);
        setMessages(data);
      } catch (err) {
        console.error("Lỗi khi tải tin nhắn:", err);
      }
    };

    fetchMessages();
  }, [conversation.conversation_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    try {
      const newMsg = await callApi<Message>(API_ROUTES.MESSENGER.SEND_MESSAGE, HTTP_METHOD_ENUM.POST, {
        conversationId: conversation.conversation_id,
        content: input,
      });
      setMessages((prev) => [...prev, newMsg]);
      setInput("");
    } catch (err) {
      console.error("Gửi tin nhắn thất bại:", err);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col w-full max-w-md border border-border rounded-xl bg-card shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted">
        <div className="flex items-center gap-2">
          <Avatar src={conversation.avatar_url || "/avatar.png"} size="sm" />
          <div>
            <p className="font-semibold text-sm text-foreground">{conversation.other_user_name}</p>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose}>
          ✖
        </Button>
      </div>

      {/* Danh sách tin nhắn */}
      <ScrollArea className="flex-1 px-4 py-3 space-y-2 overflow-y-auto max-h-[400px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[80%] px-4 py-2 rounded-lg text-sm shadow break-words",
              msg.sender_id === currentUserId ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted text-foreground"
            )}
          >
            <p>{msg.content}</p>
            <p className="text-[10px] text-right text-muted-foreground">{formatTime(msg.created_at)}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Nhập tin nhắn */}
      <div className="p-4 border-t border-border bg-muted flex gap-2">
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
