"use client";

// ----- Imports -----
import React, { useEffect, useRef, useState, useMemo } from "react";

// Local Imports
import { X, Info, Settings } from "lucide-react";
import MessageList from "@/components/messenger/MessageList";
import MessageInput from "@/components/messenger/MessageInput";
import { useGlobalSignalRConnection } from "@/components/messenger/useGlobalSignalRConnection";
import { Avatar } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, MESSAGE_TYPE } from "@/lib/constants/enum";
import { Message, SendMessageRequest, AddReactionRequest, RemoveReactionRequest } from "@/lib/models/message";
import type { MessengerPreview } from "@/lib/models/messenger_review";
import { GroupMember } from "@/lib/models/group";
import { User } from "@/lib/models/user";
import { callApi } from "@/lib/utils/api-client";
import { loadFromLocalStorage } from "@/lib/utils/local-storage";
import { cn } from "@/lib/utils/cn";
import { VideoCallIcon, PhoneIcon } from "@/components/icons/VideoCallIcons";
import VideoCall from "@/components/video-call/VideoCall";
import useVideoCall from "@/hooks/useVideoCall";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const [isOtherUserOnline, setIsOtherUserOnline] = useState(conversation.other_is_online);

  // Group-specific state
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("member");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);

  const isGroup = conversation.is_group === true;
  
  // Debug video call buttons (only once per conversation)
  useEffect(() => {
    console.log('🔍 Video call debug:', {
      isGroup,
      conversation_id: conversation.conversation_id,
      other_user_id: conversation.other_user_id,
      isOtherUserOnline,
      showVideoCallButtons: !isGroup
    });
  }, [isGroup, conversation.conversation_id, conversation.other_user_id, isOtherUserOnline]);

  // Video call integration
  const videoCallEvents = useMemo(() => ({
    onIncomingCall: (callerId: string, callerName: string) => {
      console.log('📞 Incoming call from:', callerName);
      // The VideoCall component will handle the incoming call UI
    },
    onCallAccepted: (callerId: string) => {
      console.log('📞 Call accepted by:', callerId);
    },
    onCallDeclined: (callerId: string) => {
      console.log('📞 Call declined by:', callerId);
    },
    onCallEnded: (callerId: string) => {
      console.log('📞 Call ended by:', callerId);
    }
  }), []);

  const videoCall = useVideoCall(videoCallEvents);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Global SignalR Connection
  useGlobalSignalRConnection({
    sender,
    conversation,
    messages,
    setMessages,
    setIsOtherUserOnline,
    // Group-specific props
    isGroup,
    groupMembers,
    setGroupMembers,
    onGroupEvent: (eventType, data) => {
      switch (eventType) {
        case "member_added":
          setGroupMembers((prev) => [...prev, data.member]);
          break;
        case "member_removed":
          setGroupMembers((prev) => prev.filter((m) => m.user_id !== data.userId));
          break;
        case "group_updated":
          // Update conversation info if needed
          break;
      }
    },
  });

  // ----- useEffect Hooks -----
  // Load tin nhắn ban đầu và group data
  useEffect(() => {
    const currentUser = loadFromLocalStorage("user", User);
    setSender(currentUser ?? {});

    // Nếu không có conversation_id, đây là conversation mới
    if (!conversation?.conversation_id) {
      console.log("🆕 New conversation - no messages to load");
      setMessages([]);
      return;
    }

    let isMounted = true;
    (async () => {
      try {
        console.log("🔥 Loading messages for conversation:", conversation.conversation_id);
        const response = await callApi<Message[]>(API_ROUTES.MESSENGER.MESSAGES(conversation.conversation_id ?? 0), HTTP_METHOD_ENUM.GET);
        console.log("✅ Raw API Response:", response);
        console.log("✅ Messages loaded successfully:", response?.length);

        if (isMounted) {
          console.log("🔄 Mapping response to Message objects...");
          const mappedMessages =
            response
              ?.map((m, index) => {
                console.log(`📝 Processing message ${index}:`, m);
                try {
                  return new Message(m);
                } catch (err) {
                  console.error(`❌ Error processing message ${index}:`, err, m);
                  return null;
                }
              })
              .filter((m): m is Message => m !== null) ?? [];

          console.log("🎯 Final mapped messages:", mappedMessages.length);
          setMessages(mappedMessages);
        }

        // Load group data if it's a group
        if (isGroup && isMounted) {
          try {
            console.log(`🔍 Loading group members for conversation ${conversation.conversation_id}`);
            console.log(`📊 Expected member count from conversation list: ${conversation.member_count}`);
            
            const members = await callApi<GroupMember[]>(API_ROUTES.CHAT_SERVER.GROUP_MEMBERS(conversation.conversation_id!), HTTP_METHOD_ENUM.GET);
            console.log(`📊 Actual members retrieved: ${members?.length || 0}`);
            console.log(`👥 Members:`, members?.map(m => ({ user_id: m.user_id, name: m.name })));
            
            setGroupMembers(members || []);

            const currentMember = members?.find((m) => m.user_id === currentUser?.id);
            if (currentMember) {
              setCurrentUserRole(currentMember.role);
            }
          } catch (error) {
            console.error("Failed to load group data:", error);
          }
        }
      } catch (err) {
        console.error("❌ Lỗi tải tin nhắn:", err);
        console.error("❌ Error details:", {
          conversationId: conversation.conversation_id,
          error: err,
        });
      }
    })();

    // Cập nhật lại trạng thái khi conversation thay đổi
    setIsOtherUserOnline(conversation.other_is_online);

    return () => {
      isMounted = false;
    };
  }, [conversation, isGroup]);

  // Cuộn xuống cuối
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Upload files
  const uploadFiles = async (files: File[]) => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(API_ROUTES.CHAT_SERVER.UPLOAD_FILE, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Upload error:", response.status, errorText);
          throw new Error(`Failed to upload ${file.name}: ${response.status}`);
        }

        const result = await response.json();
        console.log("Upload response:", result);
        console.log("Upload response data:", result.data);

        // Xử lý format response từ chat server
        return {
          file_name: result.data?.file_name || result.file_name || result.name || file.name,
          file_url: result.data?.file_url || result.file_url || result.url,
          file_type: result.data?.file_type || result.file_type || result.type || file.type,
          file_size: result.data?.file_size || result.file_size || result.size || file.size,
        };
      } catch (error) {
        console.error("Upload file error:", error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  };

  // Gửi tin nhắn
  const performSendMessage = async (
    content: string,
    tempId: string,
    attachments?: any[],
    contentType?: "text" | "image" | "file",
    replyToMessageId?: number
  ) => {
    const body: SendMessageRequest = {
      sender_id: sender.id!,
      content,
      message_type: isGroup ? MESSAGE_TYPE.GROUP : MESSAGE_TYPE.PRIVATE, // Loại tin nhắn (PRIVATE/PUBLIC/GROUP)
      content_type: contentType || "text", // Loại nội dung (text/image/file)
      target_id: isGroup ? undefined : conversation.other_user_id,
      reply_to_message_id: replyToMessageId,
      attachments,
    };

    // Chỉ thêm conversation_id nếu có
    if (conversation.conversation_id) {
      body.conversation_id = conversation.conversation_id;
    }

    console.log("Sending message:", body);
    console.log("Attachments detail:", JSON.stringify(attachments, null, 2));

    try {
      const res = await callApi<Message>(API_ROUTES.CHAT_SERVER.SENT_MESSAGE, HTTP_METHOD_ENUM.POST, body);
      console.log("✅ Message sent successfully:", res);

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === tempId) {
            // Preserve replied_message from optimistic if server doesn't return it
            const serverMessage = new Message(res);
            if (!serverMessage.replied_message && m.replied_message) {
              console.log("📨 Preserving replied_message from optimistic update");
              serverMessage.replied_message = m.replied_message;
            }
            return serverMessage;
          }
          return m;
        })
      );
    } catch (err) {
      console.error("Send message error:", err);
      console.error("Request body was:", body);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? new Message({ ...m, status: "Failed" }) : m)));
    }
  };

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && selectedFiles.length === 0) || !sender.id) return;

    setIsUploading(true);
    const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const content = input.trim();

    let attachments: any[] = [];
    if (selectedFiles.length > 0) {
      try {
        attachments = await uploadFiles(selectedFiles);
      } catch (error) {
        console.error("File upload failed:", error);
        setIsUploading(false);
        return;
      }
    }

    // Xác định content_type dựa trên input gửi đi
    let contentType: "text" | "image" | "file" = "text";

    if (attachments && attachments.length > 0) {
      // Nếu có attachment, check loại file
      const firstAttachment = attachments[0];
      if (firstAttachment.file_type?.startsWith("image/")) {
        contentType = "image";
      } else {
        contentType = "file";
      }
    }
    // Nếu chỉ có text mà không có attachment thì vẫn là "text"

    const optimistic = new Message({
      id: tempId,
      sender_id: sender.id,
      target_id: conversation.other_user_id,
      content,
      message_type: isGroup ? MESSAGE_TYPE.GROUP : MESSAGE_TYPE.PRIVATE, // Loại tin nhắn (PRIVATE/PUBLIC/GROUP)
      content_type: contentType, // Loại nội dung (text/image/file)
      reply_to_message_id: typeof replyingTo?.id === "number" ? replyingTo.id : undefined,
      replied_message: replyingTo
        ? {
            id: replyingTo.id,
            content: replyingTo.content,
            sender_id: replyingTo.sender_id,
            content_type: replyingTo.content_type,
            created_at: replyingTo.created_at,
          }
        : undefined,
      created_at: new Date().toISOString(),
      status: "Sending",
      attachments: attachments.map((att, index) => ({ ...att, id: `att_${Date.now()}_${index}` })),
    });

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSelectedFiles([]);
    setReplyingTo(null);
    setIsUploading(false);
    performSendMessage(content, tempId, attachments, contentType, typeof replyingTo?.id === "number" ? replyingTo.id : undefined);
  };

  const handleRetrySend = (failed: Message) => {
    if (!failed.content) return;
    setMessages((prev) => prev.filter((m) => m.id !== failed.id));
    const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const optimistic = new Message({
      ...failed,
      id: tempId,
      status: "Sending",
      created_at: new Date().toISOString(),
    });
    setMessages((prev) => [...prev, optimistic]);
    performSendMessage(failed.content, tempId, failed.attachments, failed.content_type, failed.reply_to_message_id);
  };

  const handleReplyMessage = (message: Message) => {
    setReplyingTo(message);
    // Auto focus vào input khi reply
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };

  const handleAddReaction = async (messageId: number, emoji: string) => {
    if (!sender.id) return;

    // Optimistic update for immediate UI feedback
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const newReactions = [...(msg.reactions || [])];

          // Check if user already reacted with this emoji
          const existingIndex = newReactions.findIndex((r) => r.user_id === sender.id && r.emoji === emoji);

          if (existingIndex === -1) {
            // Add new reaction optimistically
            newReactions.push({
              id: Date.now() + Math.floor(Math.random() * 1000), // temporary ID
              message_id: messageId,
              user_id: sender.id!,
              emoji,
              reacted_at: new Date().toISOString(),
            });
          }

          return new Message({ ...msg, reactions: newReactions });
        }
        return msg;
      })
    );

    const body: AddReactionRequest = {
      message_id: messageId,
      user_id: sender.id,
      emoji,
    };

    try {
      console.log("🎭 Adding reaction:", body);
      await callApi(`${API_ROUTES.CHAT_SERVER.ADD_REACTION}`, HTTP_METHOD_ENUM.POST, body);
      // Chat server sẽ broadcast ReceiveReaction event
    } catch (error) {
      console.error("❌ Add reaction error:", error);
      // Revert optimistic update on error
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const newReactions = (msg.reactions || []).filter((r) => !(r.user_id === sender.id && r.emoji === emoji));
            return new Message({ ...msg, reactions: newReactions });
          }
          return msg;
        })
      );
    }
  };

  const handleRemoveReaction = async (messageId: number, emoji: string) => {
    if (!sender.id) return;

    // Store the removed reaction for potential rollback
    let removedReaction: any = null;

    // Optimistic update for immediate UI feedback
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const newReactions = (msg.reactions || []).filter((r) => {
            const shouldRemove = r.user_id === sender.id && r.emoji === emoji;
            if (shouldRemove) {
              removedReaction = r; // Store for rollback
            }
            return !shouldRemove;
          });

          return new Message({ ...msg, reactions: newReactions });
        }
        return msg;
      })
    );

    const body: RemoveReactionRequest = {
      message_id: messageId,
      user_id: sender.id,
      emoji,
    };

    try {
      console.log("🎭 Removing reaction:", body);
      await callApi(`${API_ROUTES.CHAT_SERVER.REMOVE_REACTION}`, HTTP_METHOD_ENUM.POST, body);
      // Chat server sẽ broadcast RemoveReaction event
    } catch (error) {
      console.error("❌ Remove reaction error:", error);
      // Revert optimistic update on error
      if (removedReaction) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId) {
              const newReactions = [...(msg.reactions || []), removedReaction];
              return new Message({ ...msg, reactions: newReactions });
            }
            return msg;
          })
        );
      }
    }
  };

  // Video call handlers
  const handleStartVideoCall = () => {
    if (!isGroup && conversation.other_user_id) {
      console.log('📞 Starting video call to user ID:', conversation.other_user_id);
      console.log('📞 Current sender ID:', sender.id);
      console.log('📞 Conversation details:', {
        conversation_id: conversation.conversation_id,
        other_user_id: conversation.other_user_id,
        other_user_name: conversation.other_user_name
      });
      videoCall.startCall(conversation.other_user_id.toString(), true);
    } else {
      console.log('📞 Cannot start video call:', { isGroup, other_user_id: conversation.other_user_id });
    }
  };

  const handleStartVoiceCall = () => {
    if (!isGroup && conversation.other_user_id) {
      console.log('📞 Starting voice call to user ID:', conversation.other_user_id);
      console.log('📞 Current sender ID:', sender.id);
      videoCall.startCall(conversation.other_user_id.toString(), false);
    } else {
      console.log('📞 Cannot start voice call:', { isGroup, other_user_id: conversation.other_user_id });
    }
  };

  const handleAcceptCall = () => {
    videoCall.acceptCall();
  };

  const handleDeclineCall = () => {
    videoCall.declineCall();
  };

  const handleEndCall = () => {
    videoCall.endCall();
  };

  const handleToggleVideo = () => {
    videoCall.toggleVideo();
  };

  const handleToggleAudio = () => {
    videoCall.toggleAudio();
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // ----- JSX Render -----
  return (
    <>
      <div
        // Mobile: Full screen, Desktop: Fixed bottom-right chat window
        className={cn(
          "fixed z-40 flex flex-col overflow-hidden border bg-card shadow-2xl transition-all duration-300 ease-soft",
          // Mobile styles (default)
          "inset-0 rounded-none max-h-none",
          // Desktop styles (md+) - Fixed positioning to bottom (right is handled by style prop) 
          "md:fixed md:bottom-4 md:top-auto md:left-auto md:w-80 md:h-[480px] md:rounded-2xl md:max-h-[480px]"
        )}
        style={style}
      >
        {/* Header - Enhanced for groups and mobile */}
        <div className="flex items-center justify-between gap-3 border-b bg-card p-3 md:p-4 min-h-16 md:min-h-auto">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Avatar với chỉ báo trạng thái hoạt động */}
            <div className="relative flex-shrink-0">
              <Avatar
                src={isGroup ? conversation.group_avatar_url : conversation.avatar_url ?? "/avatar.png"}
                size="md"
                className={cn(
                  "w-10 h-10 md:w-8 md:h-8",
                  isGroup ? "rounded-lg" : "rounded-full"
                )}
              />
              {!isGroup && (
                <span
                  className={cn(
                    "absolute bottom-0 right-0 block h-3 w-3 md:h-2.5 md:w-2.5 rounded-full ring-2 ring-card",
                    isOtherUserOnline ? "bg-success" : "bg-muted-foreground"
                  )}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-base md:text-sm truncate">
                {isGroup ? conversation.name : conversation.other_user_name}
              </p>
              <p className="text-sm md:text-xs text-muted-foreground truncate">
                {isGroup
                  ? `${groupMembers.length} thành viên • ${groupMembers.filter((m) => m.is_online).length} đang online`
                  : isOtherUserOnline
                  ? "Online"
                  : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Video Call Buttons - Only for private conversations */}
            {!isGroup && (
              <>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleStartVoiceCall} 
                  title="Gọi thoại"
                  className="w-10 h-10 md:w-8 md:h-8"
                >
                  <PhoneIcon className="h-5 w-5 md:h-4 md:w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleStartVideoCall} 
                  title="Gọi video"
                  className="w-10 h-10 md:w-8 md:h-8"
                >
                  <VideoCallIcon className="h-5 w-5 md:h-4 md:w-4" />
                </Button>
              </>
            )}
            
            {isGroup && (
              <>
                <Button size="icon" variant="ghost" onClick={() => setShowGroupInfo(true)} title="Thông tin nhóm"
                  className="w-10 h-10 md:w-8 md:h-8">
                  <Info className="h-5 w-5 md:h-4 md:w-4" />
                </Button>
                {(currentUserRole === "admin" || currentUserRole === "moderator") && (
                  <Button size="icon" variant="ghost" onClick={() => setShowGroupSettings(true)} title="Cài đặt nhóm"
                    className="w-10 h-10 md:w-8 md:h-8">
                    <Settings className="h-5 w-5 md:h-4 md:w-4" />
                  </Button>
                )}
              </>
            )}
            <Button size="icon" variant="ghost" onClick={() => onClose(conversation.conversation_id!)}
              className="w-10 h-10 md:w-8 md:h-8">
              <X className="h-6 w-6 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>

        {/* Message list - Enhanced for groups and mobile */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background/50">
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4">
            <div className="space-y-3 min-h-full flex flex-col justify-end">
              <MessageList
                messages={messages}
                senderId={sender.id}
                onRetrySend={handleRetrySend}
                onReplyMessage={handleReplyMessage}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
                // Group-specific props
                isGroup={isGroup}
                getSenderName={(senderId: number) => {
                  if (!isGroup) return "";
                  const member = groupMembers.find((m) => m.user_id === senderId);
                  return member?.name || "Unknown User";
                }}
                groupMembers={groupMembers}
              />
              <div ref={bottomRef} />
            </div>
          </div>
        </div>

        {/* Message Input */}
        <MessageInput
          ref={messageInputRef}
          input={input}
          setInput={setInput}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          isUploading={isUploading}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          onSendMessage={sendMessage}
        />
      </div>

      {/* Group Modals - Responsive for mobile */}
      {isGroup && showGroupInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowGroupInfo(false)}>
          <div className="bg-card rounded-lg md:rounded-xl max-w-md w-full border shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Thông tin nhóm</h3>
              <div className="space-y-3">
                <p className="text-sm md:text-base text-muted-foreground">
                  <span className="font-medium">Tên:</span> {conversation.name}
                </p>
                <p className="text-sm md:text-base text-muted-foreground">
                  <span className="font-medium">Thành viên:</span> {groupMembers.length}
                </p>
                <p className="text-sm md:text-base text-muted-foreground">
                  <span className="font-medium">Online:</span> {groupMembers.filter((m) => m.is_online).length}
                </p>
              </div>
              <Button onClick={() => setShowGroupInfo(false)} className="w-full mt-6" size="lg">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {isGroup && showGroupSettings && (currentUserRole === "admin" || currentUserRole === "moderator") && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowGroupSettings(false)}>
          <div className="bg-card rounded-lg md:rounded-xl max-w-md w-full border shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Cài đặt nhóm</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                Bạn là <span className="font-medium text-primary">
                  {currentUserRole === "admin" ? "Quản trị viên" : "Điều hành viên"}
                </span>
              </p>
              <Button onClick={() => setShowGroupSettings(false)} className="w-full" size="lg">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Component */}
      <VideoCall
        isActive={videoCall.callState.isCallActive}
        isIncoming={videoCall.callState.isIncomingCall}
        isOutgoing={videoCall.callState.isOutgoingCall}
        callerName={videoCall.callState.callerName || conversation.other_user_name || 'Unknown'}
        callerAvatar={videoCall.callState.callerAvatar || conversation.avatar_url}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
        onEnd={handleEndCall}
        onToggleVideo={handleToggleVideo}
        onToggleAudio={handleToggleAudio}
        onToggleFullscreen={handleToggleFullscreen}
        isVideoEnabled={videoCall.callState.isVideoEnabled}
        isAudioEnabled={videoCall.callState.isAudioEnabled}
        isFullscreen={isFullscreen}
        localStream={videoCall.localStream || undefined}
        remoteStream={videoCall.remoteStream || undefined}
      />
    </>
  );
}
