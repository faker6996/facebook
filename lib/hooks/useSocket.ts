import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "@/lib/models/message";

let socket: Socket | null = null;

export function useSocket(conversationId: number, onMessage: (msg: Message) => void) {
  const hasConnectedRef = useRef(false);
  const onMessageRef = useRef(onMessage); // ✅ đảm bảo onMessage luôn mới nhất

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (hasConnectedRef.current || !conversationId) return;
    hasConnectedRef.current = true;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      path: "/api/socket",
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket?.id);
      socket?.emit("join", String(conversationId));
    });

    socket.on("new-message", (msg: Message) => {
      console.log("💬 Received new-message", msg);
      onMessageRef.current(msg); // ✅ luôn gọi callback mới nhất
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket?.id);
    });

    return () => {
      socket?.disconnect();
      hasConnectedRef.current = false;
    };
  }, [conversationId]);
}
