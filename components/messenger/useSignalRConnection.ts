import { useEffect } from "react";
import * as signalR from "@microsoft/signalr";
import { Message } from "@/lib/models/message";
import { User } from "@/lib/models/user";
import { GroupMember } from "@/lib/models/group";
import type { MessengerPreview } from "@/lib/models/messenger_review";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { callApi } from "@/lib/utils/api-client";

interface UseSignalRConnectionProps {
  sender: User;
  conversation: MessengerPreview;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsOtherUserOnline: (isOnline: boolean) => void;
  // Group-specific props
  isGroup?: boolean;
  groupMembers?: GroupMember[];
  setGroupMembers?: React.Dispatch<React.SetStateAction<GroupMember[]>>;
  onGroupEvent?: (eventType: string, data: any) => void;
}

export const useSignalRConnection = ({
  sender,
  conversation,
  messages,
  setMessages,
  setIsOtherUserOnline,
  isGroup = false,
  groupMembers = [],
  setGroupMembers,
  onGroupEvent
}: UseSignalRConnectionProps) => {
  useEffect(() => {
    if (!sender?.id || (!conversation?.other_user_id && !isGroup)) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/chathub`, {
        withCredentials: true,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 1000, 3000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Lắng nghe tin nhắn mới
    conn.on("ReceiveMessage", async (newMsg: any) => {
      let isForCurrent = false;
      
      if (isGroup) {
        // For group messages, check if message is for this conversation
        isForCurrent = newMsg.conversation_id === conversation.conversation_id;
      } else {
        // For private messages, check sender/target
        isForCurrent =
          (newMsg.sender_id === conversation.other_user_id && newMsg.target_id === sender.id) ||
          (newMsg.sender_id === sender.id && newMsg.target_id === conversation.other_user_id);
      }
      
      if (isForCurrent) {
        console.log('📨 Received new message:', newMsg);
        console.log('📨 Message with reply data:', newMsg);
        
        setMessages((prev) => {
          // Check if this is replacing an optimistic message (temp ID)
          console.log('📨 Looking for optimistic message to replace...');
          console.log('📨 Current messages:', prev.map(m => ({ id: m.id, sender_id: m.sender_id, content: m.content?.substring(0, 20) })));
          console.log('📨 New message:', { id: newMsg.id, sender_id: newMsg.sender_id, content: newMsg.content?.substring(0, 20) });
          
          const tempMessageIndex = prev.findIndex(msg => 
            typeof msg.id === 'string' && 
            msg.id.startsWith('temp_') &&
            msg.sender_id === newMsg.sender_id &&
            msg.content === newMsg.content
          );
          
          console.log('📨 Found temp message index:', tempMessageIndex);
          
          if (tempMessageIndex !== -1) {
            // Replace optimistic message with server message
            console.log('📨 Replacing optimistic message with server message');
            console.log('📨 Optimistic message had replied_message:', prev[tempMessageIndex].replied_message);
            console.log('📨 Server message has replied_message:', newMsg.replied_message);
            const updatedMessages = [...prev];
            updatedMessages[tempMessageIndex] = new Message(newMsg);
            return updatedMessages;
          } else {
            // Add new message (from other user)
            console.log('📨 Adding new message from other user');
            return [...prev, new Message(newMsg)];
          }
        });
      }
    });

    // Lắng nghe reaction events - Updated format
    conn.on("ReceiveReaction", (data: any) => {
      console.log('🎭 Received reaction via SignalR (new format):', data);
      
      // New server format: { message_id, reaction: {...} }
      if (!data || !data.message_id || !data.reaction) {
        console.warn('🎭 Invalid ReceiveReaction format:', data);
        return;
      }
      
      const { message_id, reaction } = data;
      console.log('🎭 Processing - message_id:', message_id, 'reaction:', reaction);
      
      setMessages((prev) => prev.map(msg => {
        if (msg.id === message_id) {
          const newReactions = [...(msg.reactions || [])];
          
          // Kiểm tra nếu user đã react với emoji này (tránh duplicate)
          const existingIndex = newReactions.findIndex(r => 
            r.user_id === reaction.user_id && r.emoji === reaction.emoji
          );
          
          if (existingIndex === -1) {
            // Thêm reaction mới từ SignalR
            console.log('🎭 Adding reaction from SignalR:', reaction);
            newReactions.push(reaction);
          } else {
            // Reaction đã tồn tại (từ optimistic update), update với data từ server
            console.log('🎭 Updating existing reaction with server data:', reaction);
            newReactions[existingIndex] = reaction;
          }
          
          return new Message({ ...msg, reactions: newReactions });
        }
        return msg;
      }));
    });

    conn.on("RemoveReaction", (data: any) => {
      console.log('🎭 Remove reaction via SignalR (new format):', data);
      
      // New server format: { message_id, user_id, emoji }
      if (!data || !data.message_id || !data.user_id || !data.emoji) {
        console.warn('🎭 Invalid RemoveReaction format:', data);
        return;
      }
      
      const { message_id, user_id, emoji } = data;
      console.log('🎭 Processing remove - message_id:', message_id, 'user_id:', user_id, 'emoji:', emoji);
      
      setMessages((prev) => prev.map(msg => {
        if (msg.id === message_id) {
          const newReactions = (msg.reactions || []).filter(r => 
            !(r.user_id === user_id && r.emoji === emoji)
          );
          
          console.log('🎭 Removed reaction from SignalR, remaining reactions:', newReactions);
          return new Message({ ...msg, reactions: newReactions });
        }
        return msg;
      }));
    });

    // Lắng nghe sự kiện trạng thái
    conn.on("UserOnline", (userId: string) => {
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

    // Enhanced connection monitoring
    conn.onclose((error) => {
      if (error) {
        console.warn("🔴 SignalR connection closed unexpectedly:", error);
      } else {
        console.log("🔵 SignalR connection closed cleanly");
      }
      console.log("🔍 Connection state:", conn.state);
      console.log("ℹ️ Auto-reconnect will attempt shortly...");
    });

    conn.onreconnecting((error) => {
      console.log("🟡 SignalR reconnecting...", error || "Network reconnection");
      console.log("🔍 Connection state:", conn.state);
    });

    conn.onreconnected(async (connectionId) => {
      console.log("🟢 SignalR reconnected successfully:", connectionId);
      console.log("🔍 Connection state:", conn.state);
      console.log("✅ Chat functionality restored");
      
      // Rejoin group if needed
      if (isGroup && conversation.conversation_id) {
        try {
          await conn.invoke('JoinGroup', conversation.conversation_id.toString());
          console.log("🏠 Rejoined group:", conversation.conversation_id);
        } catch (error) {
          console.error("❌ Failed to rejoin group:", error);
        }
      }
    });

    // Group-specific event listeners
    if (isGroup) {
      conn.on("GroupMemberAdded", (data: { groupId: number, member: GroupMember }) => {
        console.log('👥 Member added:', data);
        if (data.groupId === conversation.conversation_id) {
          setGroupMembers?.(prev => [...prev, data.member]);
          onGroupEvent?.('member_added', data);
        }
      });

      conn.on("GroupMemberRemoved", (data: { groupId: number, userId: number, reason: string }) => {
        console.log('👥 Member removed:', data);
        if (data.groupId === conversation.conversation_id) {
          setGroupMembers?.(prev => prev.filter(m => m.user_id !== data.userId));
          onGroupEvent?.('member_removed', data);
        }
      });

      conn.on("GroupMemberPromoted", (data: { groupId: number, userId: number, newRole: string }) => {
        console.log('👑 Member promoted:', data);
        if (data.groupId === conversation.conversation_id) {
          setGroupMembers?.(prev => prev.map(m => 
            m.user_id === data.userId ? { ...m, role: data.newRole as any } : m
          ));
          onGroupEvent?.('member_promoted', data);
        }
      });

      conn.on("GroupUpdated", (data: { groupId: number, group: any }) => {
        console.log('📝 Group updated:', data);
        if (data.groupId === conversation.conversation_id) {
          onGroupEvent?.('group_updated', data);
        }
      });

      conn.on("UserJoinedGroup", (data: { groupId: number, userId: number }) => {
        console.log('👋 User joined group:', data);
        if (data.groupId === conversation.conversation_id) {
          setGroupMembers?.(prev => prev.map(m => 
            m.user_id === data.userId ? { ...m, is_online: true } : m
          ));
        }
      });

      conn.on("UserLeftGroup", (data: { groupId: number, userId: number }) => {
        console.log('👋 User left group:', data);
        if (data.groupId === conversation.conversation_id) {
          setGroupMembers?.(prev => prev.map(m => 
            m.user_id === data.userId ? { ...m, is_online: false } : m
          ));
        }
      });
    }

    // Start connection with retry
    const startConnection = async () => {
      try {
        console.log("🔄 Starting SignalR connection...");
        console.log("🔍 Initial connection state:", conn.state);
        console.log("🔍 Connection URL:", `${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/chathub`);
        await conn.start();
        console.log("✅ SignalR connected successfully");
        console.log("🔍 Final connection state:", conn.state);
        
        // Join group if it's a group conversation
        if (isGroup && conversation.conversation_id) {
          try {
            await conn.invoke('JoinGroup', conversation.conversation_id.toString());
            console.log("🏠 Joined group:", conversation.conversation_id);
          } catch (error) {
            console.error("❌ Failed to join group:", error);
          }
        }
        
        console.log("🎯 Ready to receive events: ReceiveMessage, ReceiveReaction, RemoveReaction", isGroup ? "+ Group Events" : "");
      } catch (err) {
        console.error("❌ SignalR connection failed:", err);
        console.log("🔍 Failed connection state:", conn.state);
        // Retry after 5 seconds
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    // Cleanup
    return () => {
      // Leave group before disconnecting
      if (isGroup && conversation.conversation_id) {
        conn.invoke('LeaveGroup', conversation.conversation_id.toString()).catch(console.error);
      }
      
      // Remove group event listeners
      if (isGroup) {
        conn.off('GroupMemberAdded');
        conn.off('GroupMemberRemoved');
        conn.off('GroupMemberPromoted');
        conn.off('GroupUpdated');
        conn.off('UserJoinedGroup');
        conn.off('UserLeftGroup');
      }
      
      conn.stop();
    };
  }, [sender.id, conversation.other_user_id, conversation.conversation_id, isGroup, messages]);
};