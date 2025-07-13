"use client";

import { useEffect } from "react";
import { useSignalR } from "@/contexts/SignalRContext";
import { User } from "@/lib/models/user";

/**
 * Hook để tự động khởi tạo SignalR connection khi user login
 * Sử dụng trong layout hoặc root component để đảm bảo SignalR luôn active
 */
export const useGlobalSignalR = (user: User | null) => {
  const { setUser, isConnected, onlineUsers, joinGroup, leaveGroup } = useSignalR();

  useEffect(() => {
    if (user) {
      console.log("🔄 Setting user for global SignalR:", user.id);
      setUser(user);
    } else {
      console.log("🔌 Clearing user from global SignalR");
      setUser(null);
    }
  }, [user, setUser]);

  return {
    isConnected,
    onlineUsers,
    joinGroup,
    leaveGroup
  };
};