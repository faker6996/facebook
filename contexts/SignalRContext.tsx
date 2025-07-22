"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { User } from "@/lib/models/user";
import { Message } from "@/lib/models/message";
import { useToast } from "@/components/ui/Toast";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { callApi } from "@/lib/utils/api-client";
import { signalRLogger } from "@/lib/utils/logger";

// SignalR Configuration Constants
const SIGNALR_CONFIG = {
  RECONNECT_DELAYS: [0, 1000, 3000, 10000, 30000] as number[], // Exponential backoff in milliseconds
  TOAST_DURATION: 5000, // Toast notification duration
  DEFAULT_TIMEOUT: 30000, // Default connection timeout
};

interface SignalRContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  // Event handler setters - components use these to register/unregister handlers
  onNewMessage: (handler: ((message: Message) => void) | undefined) => void;
  onUserOnline: (handler: ((userId: string) => void) | undefined) => void;
  onUserOffline: (handler: ((userId: string) => void) | undefined) => void;
  // Group events
  onGroupEvent: (handler: ((eventType: string, data: any) => void) | undefined) => void;
  // Connection management
  joinGroup: (groupId: string) => Promise<void>;
  leaveGroup: (groupId: string) => Promise<void>;
  // User management
  setUser: (user: User | null) => void;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) {
    throw new Error("useSignalR must be used within SignalRProvider");
  }
  return context;
};

interface SignalRProviderProps {
  children: React.ReactNode;
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const { addToast } = useToast();
  
  // Event handlers - using refs to prevent memory leaks
  const messageHandlerRef = useRef<((message: Message) => void) | undefined>(undefined);
  const userOnlineHandlerRef = useRef<((userId: string) => void) | undefined>(undefined);
  const userOfflineHandlerRef = useRef<((userId: string) => void) | undefined>(undefined);
  const groupEventHandlerRef = useRef<((eventType: string, data: any) => void) | undefined>(undefined);

  // Setter functions for external components to register handlers
  const setMessageHandler = useCallback((handler: ((message: Message) => void) | undefined) => {
    messageHandlerRef.current = handler;
  }, []);

  const setUserOnlineHandler = useCallback((handler: ((userId: string) => void) | undefined) => {
    userOnlineHandlerRef.current = handler;
  }, []);

  const setUserOfflineHandler = useCallback((handler: ((userId: string) => void) | undefined) => {
    userOfflineHandlerRef.current = handler;
  }, []);

  const setGroupEventHandler = useCallback((handler: ((eventType: string, data: any) => void) | undefined) => {
    groupEventHandlerRef.current = handler;
  }, []);

  const setUser = (user: User | null) => {
    setCurrentUser(user);
  };

  const createConnection = async (user: User) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      signalRLogger.info("Already connected, skipping...");
      return connectionRef.current;
    }

    signalRLogger.info("Creating global SignalR connection", { userId: user.id });

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/chathub`, {
        withCredentials: true,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect(SIGNALR_CONFIG.RECONNECT_DELAYS)
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Global message listener - nhận tất cả tin nhắn
    conn.on("ReceiveMessage", (newMsg: any) => {
      console.log("📨 Global: Received new message:", newMsg);
      console.log("🔍 DEBUG Global: Message routing key debug:", {
        message_type: newMsg.message_type,
        conversation_id: newMsg.conversation_id,
        sender_id: newMsg.sender_id,
        target_id: newMsg.target_id
      });
      
      // Hiển thị toast notification nếu không đang trong conversation đó
      const messageObj = new Message(newMsg);
      
      // Notify global handler nếu có
      messageHandlerRef.current?.(messageObj);
      
      // Hiển thị toast notification
      if (newMsg.sender_id !== user.id) {
        addToast({
          type: "info",
          title: "New Message",
          message: `${newMsg.sender_name || 'Someone'}: ${newMsg.content?.substring(0, 50)}${newMsg.content?.length > 50 ? '...' : ''}`,
          duration: 4000
        });
      }
    });

    // Group message listener - nhận tin nhắn nhóm
    conn.on("ReceiveGroupMessage", (data: any) => {
      console.log("📨 Global: Received GROUP message:", data);
      
      // Handle different backend message formats
      let messageData;
      if (data.message && data.group_id) {
        // Backend format: {group_id: 22, message: {...}}
        messageData = {
          ...data.message,
          conversation_id: data.group_id // Map group_id to conversation_id
        };
      } else {
        // Direct message format
        messageData = data;
      }
      
      console.log("🔍 DEBUG Global: Group message processed:", {
        message_type: messageData.message_type,
        conversation_id: messageData.conversation_id,
        sender_id: messageData.sender_id,
        target_id: messageData.target_id
      });
      
      // Hiển thị toast notification nếu không đang trong conversation đó
      const messageObj = new Message(messageData);
      
      // Call message handler để xử lý tin nhắn group
      if (messageHandlerRef.current) {
        messageHandlerRef.current(messageObj);
      }

      // Hiển thị toast notification
      if (messageData.sender_id !== user.id) {
        addToast({
          type: "info",
          title: "New Group Message",
          message: `${messageData.sender_name || 'Someone'}: ${messageData.content?.substring(0, 50)}${messageData.content?.length > 50 ? '...' : ''}`,
          duration: 4000
        });
      }
    });

    // Global reaction listener
    conn.on("ReceiveReaction", (data: any) => {
      console.log("🎭 Global: Received reaction:", data);
      // Có thể hiển thị notification hoặc xử lý global
    });

    conn.on("RemoveReaction", (data: any) => {
      console.log("🎭 Global: Removed reaction:", data);
    });

    // Online/Offline status listeners
    conn.on("UserOnline", (userId: string) => {
      console.log(`👤 User ${userId} is now ONLINE`);
      setOnlineUsers(prev => new Set([...prev, userId]));
      userOnlineHandlerRef.current?.(userId);
    });

    conn.on("UserOffline", (userId: string) => {
      console.log(`👤 User ${userId} is now OFFLINE`);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      userOfflineHandlerRef.current?.(userId);
    });

    // Group event listeners
    conn.on("GroupMemberAdded", (data: any) => {
      console.log("👥 Global: Member added to group:", data);
      groupEventHandlerRef.current?.("member_added", data);
      
      if (data.member?.user_id !== user.id) {
        addToast({
          type: "info",
          title: "Group Update",
          message: `${data.member?.user_name || 'Someone'} joined the group`,
          duration: 3000
        });
      }
    });

    conn.on("GroupMemberRemoved", (data: any) => {
      console.log("👥 Global: Member removed from group:", data);
      groupEventHandlerRef.current?.("member_removed", data);
      
      if (data.userId !== user.id) {
        addToast({
          type: "warning",
          title: "Group Update", 
          message: `Someone left the group`,
          duration: 3000
        });
      }
    });

    conn.on("GroupMemberPromoted", (data: any) => {
      console.log("👑 Global: Member promoted:", data);
      groupEventHandlerRef.current?.("member_promoted", data);
      
      addToast({
        type: "success",
        title: "Role Update",
        message: `Someone was promoted to ${data.newRole}`,
        duration: 3000
      });
    });

    conn.on("GroupUpdated", (data: any) => {
      console.log("📝 Global: Group updated:", data);
      groupEventHandlerRef.current?.("group_updated", data);
      
      addToast({
        type: "info",
        title: "Group Update",
        message: "Group information was updated",
        duration: 3000
      });
    });

    // Connection event handlers
    conn.onreconnecting((error) => {
      console.log("🟡 Global SignalR reconnecting...", error);
      setIsConnected(false);
    });

    conn.onreconnected(async (connectionId) => {
      console.log("🟢 Global SignalR reconnected:", connectionId);
      setIsConnected(true);
      
      // Sync missed messages
      try {
        console.log("🔄 Syncing missed messages...");
        const missed = await callApi<Message[]>(
          `${API_ROUTES.MESSENGER.SYNC}?lastMessageId=0`,
          HTTP_METHOD_ENUM.GET
        );
        
        if (missed?.length) {
          console.log(`📨 Found ${missed.length} missed messages`);
          // Có thể emit event để các component khác xử lý
        }
      } catch (error) {
        console.error("❌ Failed to sync missed messages:", error);
      }
    });

    conn.onclose((error) => {
      console.log("🔴 Global SignalR connection closed:", error);
      setIsConnected(false);
      
      if (error) {
        addToast({
          type: "warning",
          title: "Connection Lost",
          message: "Reconnecting to chat server...",
          duration: 3000
        });
      }
    });

    // Start connection
    try {
      await conn.start();
      console.log("✅ Global SignalR connected successfully");
      setIsConnected(true);
      setConnection(conn);
      connectionRef.current = conn;
      
      addToast({
        type: "success",
        title: "Connected",
        message: "Chat is now online",
        duration: 2000
      });
      
      return conn;
    } catch (error) {
      console.error("❌ Failed to start global SignalR connection:", error);
      
      addToast({
        type: "error",
        title: "Connection Failed",
        message: "Unable to connect to chat server",
        duration: SIGNALR_CONFIG.TOAST_DURATION
      });
      
      throw error;
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      console.warn("⚠️ Cannot join group - no active connection");
      return;
    }

    try {
      console.log("🏠 Global: Joining group:", groupId);
      await connectionRef.current.invoke("JoinGroup", groupId);
      console.log("✅ Global: Successfully joined group:", groupId);
    } catch (error) {
      console.error("❌ Global: Failed to join group:", error);
      throw error;
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      console.warn("⚠️ Cannot leave group - no active connection");
      return;
    }

    try {
      console.log("🚪 Global: Leaving group:", groupId);
      await connectionRef.current.invoke("LeaveGroup", groupId);
      console.log("✅ Global: Successfully left group:", groupId);
    } catch (error) {
      console.error("❌ Global: Failed to leave group:", error);
      throw error;
    }
  };

  // Initialize connection when user is set
  useEffect(() => {
    if (currentUser) {
      console.log("🚀 Initializing SignalR for user:", currentUser.id);
      createConnection(currentUser).catch(error => {
        console.error("❌ Failed to initialize SignalR:", error);
      });
    } else {
      // Disconnect when user logs out
      if (connectionRef.current) {
        console.log("🔌 Disconnecting SignalR - user logged out");
        connectionRef.current.stop();
        connectionRef.current = null;
        setConnection(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      }
    }

    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        console.log("🔌 Cleaning up SignalR connection");
        connectionRef.current.stop();
      }
    };
  }, [currentUser]);

  const value: SignalRContextType = {
    connection: connectionRef.current,
    isConnected,
    onlineUsers,
    onNewMessage: setMessageHandler,
    onUserOnline: setUserOnlineHandler,
    onUserOffline: setUserOfflineHandler,
    onGroupEvent: setGroupEventHandler,
    joinGroup,
    leaveGroup,
    setUser
  };

  return (
    <SignalRContext.Provider value={value}>
      {children}
    </SignalRContext.Provider>
  );
};