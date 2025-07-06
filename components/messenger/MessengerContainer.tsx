"use client";

// ----- Imports -----
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";

// Local Imports
import { CirclePlus, SendHorizontal, X } from "lucide-react";
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
  const bottomRef = useRef<HTMLDivElement>(null);

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

    return () => {
      isMounted = false;
    };
  }, [conversation?.conversation_id]);

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

  // Gửi tin nhắn
  const performSendMessage = async (content: string, tempId: string) => {
    const body: SendMessageRequest = {
      sender_id: sender.id!,
      content,
      conversation_id: conversation.conversation_id!,
      message_type: MESSAGE_TYPE.PRIVATE,
      target_id: conversation.other_user_id,
    };

    try {
      const res = await callApi<Message>(API_ROUTES.CHAT_SERVER.SENT_MESSAGE, HTTP_METHOD_ENUM.POST, body);
      const saved = new Message(res);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
    } catch (err) {
      console.error("Send message error:", err);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? new Message({ ...m, status: "Failed" }) : m)));
    }
  };

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !sender.id) return;

    const tempId = `temp_${Date.now()}`;
    const content = input.trim();
    const optimistic = new Message({
      id: tempId,
      sender_id: sender.id,
      target_id: conversation.other_user_id,
      content,
      message_type: "text",
      created_at: new Date().toISOString(),
      status: "Sending",
    });

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    performSendMessage(content, tempId);
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
    performSendMessage(failed.content, tempId);
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
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-card" />
            </div>
            <div>
              <p className="font-semibold">{conversation.other_user_name}</p>
              <p className="text-xs text-muted-foreground">Đang hoạt động</p>
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
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            {/* Các nút hành động phụ */}
            <Button type="button" size="icon" variant="ghost" className="flex-shrink-0">
              <CirclePlus className="h-5 w-5 text-muted-foreground" />
            </Button>
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
            <Button type="submit" size="icon" variant="ghost" className="flex-shrink-0" disabled={!input.trim()}>
              <SendHorizontal className={`h-5 w-5 transition-colors ${input.trim() ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
