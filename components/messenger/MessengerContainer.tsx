"use client";

// ----- Imports -----
import React, { useEffect, useState, useMemo } from "react";

// Local Imports
import MessageInput from "@/components/messenger/MessageInput";
import { MessengerHeader } from "@/components/messenger/MessengerHeader";
import { MessengerContent } from "@/components/messenger/MessengerContent";
import { useGlobalSignalRConnection } from "@/components/messenger/useGlobalSignalRConnection";
import { useMessengerScroll } from "@/hooks/useMessengerScroll";
import { useMessageHandler } from "@/hooks/useMessageHandler";
import { useMessagePagination } from "@/hooks/useMessagePagination";
import Button from "@/components/ui/Button";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import type { MessengerPreview } from "@/lib/models/messenger_review";
import { GroupMember } from "@/lib/models/group";
import { User } from "@/lib/models/user";
import { callApi } from "@/lib/utils/api-client";
import { loadFromLocalStorage } from "@/lib/utils/local-storage";
import { cn } from "@/lib/utils/cn";
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
  // ----- Basic State -----
  const [sender, setSender] = useState<User>({});
  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(conversation.other_is_online);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Refs
  const messageInputRef = React.useRef<HTMLInputElement>(null);

  // ----- Message Handler Hook -----
  const {
    messages,
    setMessages,
    replyingTo,
    setReplyingTo,
    sendMessage,
    handleRetrySend,
    handleReplyMessage,
    handleAddReaction,
    handleRemoveReaction
  } = useMessageHandler({
    conversation,
    sender,
    onScrollToBottom: (delay, reason) => {}, // Will be set later
    onSetShouldAutoScroll: () => {} // Will be set later
  });

  // ----- Pagination Hook -----
  const {
    currentPage,
    hasMoreMessages,
    isLoadingMessages,
    totalMessageCount,
    isInitialLoad,
    loadMessages,
    loadMoreMessages,
    resetPaginationState
  } = useMessagePagination({
    conversation,
    onScrollToBottom: (delay, reason) => {}, // Will be set later
    onSetMessages: setMessages
  });

  // ----- Scroll Hook -----
  const {
    bottomRef,
    messagesContainerRef,
    shouldAutoScroll,
    setShouldAutoScroll,
    scrollToBottom,
    resetScrollState
  } = useMessengerScroll({
    messages,
    isLoadingMessages,
    isInitialLoad,
    conversation,
    onLoadMore: loadMoreMessages,
    hasMoreMessages
  });

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

    // Reset pagination state when conversation changes
    resetPaginationState();
    resetScrollState();
    setIsUserScrolling(false);

    let isMounted = true;
    (async () => {
      if (isMounted) {
        await loadMessages(1, false);

        // Load group data if it's a group
        if (isGroup && conversation?.conversation_id && isMounted) {
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
      }
    })();

    // Cập nhật lại trạng thái khi conversation thay đổi
    setIsOtherUserOnline(conversation.other_is_online);

    return () => {
      isMounted = false;
    };
  }, [conversation, isGroup]);





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
        <MessengerHeader
          conversation={conversation}
          isOtherUserOnline={isOtherUserOnline ?? false}
          groupMembers={groupMembers}
          currentUserRole={currentUserRole}
          onClose={onClose}
          onStartVideoCall={handleStartVideoCall}
          onStartVoiceCall={handleStartVoiceCall}
          onShowGroupInfo={setShowGroupInfo}
          onShowGroupSettings={setShowGroupSettings}
        />

        {/* Message list - Enhanced for groups and mobile */}
        <MessengerContent
          messagesContainerRef={messagesContainerRef}
          bottomRef={bottomRef}
          messages={messages}
          senderId={sender.id}
          isLoadingMessages={isLoadingMessages}
          hasMoreMessages={hasMoreMessages}
          isInitialLoad={isInitialLoad}
          totalMessageCount={totalMessageCount}
          isGroup={isGroup}
          groupMembers={groupMembers}
          onRetrySend={handleRetrySend}
          onReplyMessage={handleReplyMessage}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
          getSenderName={(senderId: number) => {
            if (!isGroup) return "";
            const member = groupMembers.find((m) => m.user_id === senderId);
            return member?.name || "Unknown User";
          }}
        />

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
          onSendMessage={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            sendMessage(input, selectedFiles, setInput, setSelectedFiles, setIsUploading);
          }}
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
