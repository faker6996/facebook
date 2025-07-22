"use client";

import { useEffect } from "react";
import { useSignalR } from "@/contexts/SignalRContext";
import { Message } from "@/lib/models/message";
import { User } from "@/lib/models/user";
import { GroupMember } from "@/lib/models/group";
import type { MessengerPreview } from "@/lib/models/messenger_review";

interface UseGlobalSignalRConnectionProps {
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

/**
 * Hook để kết nối MessengerContainer với global SignalR connection
 * Thay thế cho useSignalRConnection để tránh tạo multiple connections
 */
export const useGlobalSignalRConnection = ({
  sender,
  conversation,
  messages,
  setMessages,
  setIsOtherUserOnline,
  isGroup = false,
  setGroupMembers,
  onGroupEvent
}: UseGlobalSignalRConnectionProps) => {
  const { connection, isConnected, onlineUsers, joinGroup, leaveGroup } = useSignalR();

  // Set up message handler cho conversation hiện tại
  useEffect(() => {
    if (!connection || !isConnected) return;

    const handleReceiveMessage = (data: any) => {
      // Handle different backend message formats
      let newMsg;
      if (data.message && data.group_id) {
        // Backend format: {group_id: 22, message: {...}}
        newMsg = {
          ...data.message,
          conversation_id: data.group_id // Map group_id to conversation_id
        };
      } else {
        // Direct message format
        newMsg = data;
      }
      
      console.log("🔍 DEBUG: Received message for group check:", {
        newMsg_conversationId: newMsg.conversation_id,
        current_conversationId: conversation.conversation_id,
        isGroup,
        original_data: data,
        processed_message: newMsg
      });
      
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
        console.log('📨 Messenger: Received message for current conversation:', newMsg);
        
        setMessages((prev) => {
          // Check if this is replacing an optimistic message (temp ID)
          const tempMessageIndex = prev.findIndex(msg => 
            typeof msg.id === 'string' && 
            msg.id.startsWith('temp_') &&
            msg.sender_id === newMsg.sender_id &&
            msg.content === newMsg.content
          );
          
          if (tempMessageIndex !== -1) {
            // Replace optimistic message with server message
            const updatedMessages = [...prev];
            updatedMessages[tempMessageIndex] = new Message(newMsg);
            return updatedMessages;
          } else {
            // Add new message (from other user)
            return [...prev, new Message(newMsg)];
          }
        });
      }
    };

    const handleReceiveReaction = (data: any) => {
      if (!data || !data.message_id || !data.reaction) return;
      
      const { message_id, reaction } = data;
      
      setMessages((prev) => prev.map(msg => {
        if (msg.id === message_id) {
          const newReactions = [...(msg.reactions || [])];
          
          const existingIndex = newReactions.findIndex(r => 
            r.user_id === reaction.user_id && r.emoji === reaction.emoji
          );
          
          if (existingIndex === -1) {
            newReactions.push(reaction);
          } else {
            newReactions[existingIndex] = reaction;
          }
          
          return new Message({ ...msg, reactions: newReactions });
        }
        return msg;
      }));
    };

    const handleRemoveReaction = (data: any) => {
      if (!data || !data.message_id || !data.user_id || !data.emoji) return;
      
      const { message_id, user_id, emoji } = data;
      
      setMessages((prev) => prev.map(msg => {
        if (msg.id === message_id) {
          const newReactions = (msg.reactions || []).filter(r => 
            !(r.user_id === user_id && r.emoji === emoji)
          );
          
          return new Message({ ...msg, reactions: newReactions });
        }
        return msg;
      }));
    };

    const handleGroupMemberAdded = (data: { groupId: number, member: GroupMember }) => {
      if (data.groupId === conversation.conversation_id) {
        setGroupMembers?.(prev => [...prev, data.member]);
        onGroupEvent?.('member_added', data);
      }
    };

    const handleGroupMemberRemoved = (data: { groupId: number, userId: number, reason: string }) => {
      if (data.groupId === conversation.conversation_id) {
        setGroupMembers?.(prev => prev.filter(m => m.user_id !== data.userId));
        onGroupEvent?.('member_removed', data);
      }
    };

    const handleGroupMemberPromoted = (data: { groupId: number, userId: number, newRole: string }) => {
      if (data.groupId === conversation.conversation_id) {
        setGroupMembers?.(prev => prev.map(m => 
          m.user_id === data.userId ? { ...m, role: data.newRole as any } : m
        ));
        onGroupEvent?.('member_promoted', data);
      }
    };

    const handleGroupUpdated = (data: { groupId: number, group: any }) => {
      if (data.groupId === conversation.conversation_id) {
        onGroupEvent?.('group_updated', data);
      }
    };

    const handleUserJoinedGroup = (data: { groupId: number, userId: number }) => {
      if (data.groupId === conversation.conversation_id) {
        setGroupMembers?.(prev => prev.map(m => 
          m.user_id === data.userId ? { ...m, is_online: true } : m
        ));
      }
    };

    const handleUserLeftGroup = (data: { groupId: number, userId: number }) => {
      if (data.groupId === conversation.conversation_id) {
        setGroupMembers?.(prev => prev.map(m => 
          m.user_id === data.userId ? { ...m, is_online: false } : m
        ));
      }
    };

    // Register event listeners
    connection.on("ReceiveMessage", handleReceiveMessage);
    connection.on("ReceiveGroupMessage", handleReceiveMessage); // Group messages cũng dùng chung handler
    connection.on("ReceiveReaction", handleReceiveReaction);
    connection.on("RemoveReaction", handleRemoveReaction);

    // Group event listeners
    if (isGroup) {
      connection.on("GroupMemberAdded", handleGroupMemberAdded);
      connection.on("GroupMemberRemoved", handleGroupMemberRemoved);
      connection.on("GroupMemberPromoted", handleGroupMemberPromoted);
      connection.on("GroupUpdated", handleGroupUpdated);
      connection.on("UserJoinedGroup", handleUserJoinedGroup);
      connection.on("UserLeftGroup", handleUserLeftGroup);
    }

    // Cleanup
    return () => {
      connection.off("ReceiveMessage", handleReceiveMessage);
      connection.off("ReceiveGroupMessage", handleReceiveMessage);
      connection.off("ReceiveReaction", handleReceiveReaction);
      connection.off("RemoveReaction", handleRemoveReaction);

      if (isGroup) {
        connection.off("GroupMemberAdded", handleGroupMemberAdded);
        connection.off("GroupMemberRemoved", handleGroupMemberRemoved);
        connection.off("GroupMemberPromoted", handleGroupMemberPromoted);
        connection.off("GroupUpdated", handleGroupUpdated);
        connection.off("UserJoinedGroup", handleUserJoinedGroup);
        connection.off("UserLeftGroup", handleUserLeftGroup);
      }
    };
  }, [connection, isConnected, conversation, sender.id, isGroup, setMessages, setGroupMembers, onGroupEvent]);

  // Handle online/offline status for private conversations
  useEffect(() => {
    if (!isGroup && conversation.other_user_id) {
      const otherUserId = conversation.other_user_id.toString();
      const isOnlineFromSignalR = onlineUsers.has(otherUserId);
      
      console.log('🟢 Online status check:', {
        other_user_id: conversation.other_user_id,
        otherUserIdString: otherUserId,
        onlineUsers: Array.from(onlineUsers),
        onlineUsersSize: onlineUsers.size,
        isOnlineFromSignalR,
        isConnected,
        conversation_name: conversation.other_user_name
      });
      
      // If SignalR has online users data, use it
      // Otherwise fall back to connection status (better than always showing offline)
      const finalOnlineStatus = onlineUsers.size > 0 ? isOnlineFromSignalR : isConnected;
      
      setIsOtherUserOnline(finalOnlineStatus);
    }
  }, [onlineUsers, conversation.other_user_id, isGroup, setIsOtherUserOnline, isConnected]);

  // Join/leave group when conversation changes
  useEffect(() => {
    if (!isGroup || !conversation.conversation_id || !isConnected) return;

    const groupId = conversation.conversation_id.toString();
    
    // Join group
    joinGroup(groupId).catch(error => {
      console.error("❌ Failed to join group:", error);
    });

    // Leave group on cleanup
    return () => {
      leaveGroup(groupId).catch(error => {
        console.error("❌ Failed to leave group:", error);
      });
    };
  }, [conversation.conversation_id, isGroup, isConnected]);

  return {
    isConnected,
    connection
  };
};