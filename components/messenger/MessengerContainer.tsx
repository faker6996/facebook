import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar";

import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Message } from "@/lib/models/message";

export default function MessengerContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage: Message = new Message({
      id: Date.now(),
      sender_id: "you",
      content: input,
      created_at: new Date().toLocaleTimeString(),
    });
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-md mx-auto border rounded-xl bg-white dark:bg-zinc-900 shadow-md overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Avatar src="/avatar.png" size="sm" />
        <div>
          <p className="font-semibold text-sm">Nguyễn Tuấn Anh</p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-3 space-y-2 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "max-w-[80%] px-4 py-2 rounded-lg text-sm shadow-md break-words",
              msg.sender_id === "you" ? "ml-auto bg-blue-500 text-white" : "mr-auto bg-gray-200 text-black"
            )}
          >
            <p>{msg.content}</p>
            <p className="text-[10px] text-right opacity-70">{msg.created_at}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>

      <div className="p-4 border-t bg-muted flex gap-2">
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
