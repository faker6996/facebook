"use client";

// ----- Imports -----
import React, { useEffect, useState, useMemo } from "react";
import { Phone, PhoneOff } from "lucide-react";
import { useTranslations } from 'next-intl';

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
import { useGroupCall } from "@/hooks/useGroupCall";
import { GroupVideoCall } from "@/components/video-call/GroupVideoCall";
// Video calls handled by GlobalVideoCallManager
// import VideoCall from "@/components/video-call/VideoCall";
// import useVideoCall from "@/hooks/useVideoCall";

// ----- Props Interface -----
interface Props {
  conversation: MessengerPreview;
  onClose: (conversationId: number) => void;
  style?: React.CSSProperties;
}

// ----- Component Definition -----
export default function MessengerContainer({ conversation, onClose, style }: Props) {
  const t = useTranslations('GroupCall');
  
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
    handleRemoveReaction,
  } = useMessageHandler({
    conversation,
    sender,
    onScrollToBottom: (delay, reason) => {}, // Will be set later
    onSetShouldAutoScroll: () => {}, // Will be set later
  });

  // ----- Pagination Hook -----
  const { currentPage, hasMoreMessages, isLoadingMessages, totalMessageCount, isInitialLoad, loadError, hasUserLoadedMore, loadMessages, loadMoreMessages, retryLoadMessages, resetPaginationState } =
    useMessagePagination({
      conversation,
      onScrollToBottom: (delay, reason) => {}, // Will be set later
      onSetMessages: setMessages,
    });

  // ----- Scroll Hook -----
  const { bottomRef, messagesContainerRef, shouldAutoScroll, setShouldAutoScroll, scrollToBottom, resetScrollState } = useMessengerScroll({
    messages,
    isLoadingMessages,
    isInitialLoad,
    conversation,
    onLoadMore: loadMoreMessages,
    hasMoreMessages,
  });

  // Group-specific state
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>("member");
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);

  const isGroup = conversation.is_group === true;

  // Group call hook
  const groupCall = useGroupCall({
    currentUser: sender,
    onCallStateChange: (isActive) => {
      console.log('📞 Group call state changed:', isActive);
    },
    onError: (error) => {
      console.error('📞 Group call error:', error);
    }
  });

  // Debug video call buttons (only once per conversation)
  useEffect(() => {
    console.log("🔍 Video call debug:", {
      isGroup,
      conversation_id: conversation.conversation_id,
      other_user_id: conversation.other_user_id,
      isOtherUserOnline,
      showVideoCallButtons: !isGroup,
    });
  }, [isGroup, conversation.conversation_id, conversation.other_user_id, isOtherUserOnline]);

  // Video call integration
  // Global video call manager handles all video calls
  // const videoCallEvents = useMemo(
  //   () => ({
  //     onIncomingCall: (callerId: string, callerName: string) => {
  //       console.log("📞 Incoming call from:", callerName);
  //       // The VideoCall component will handle the incoming call UI
  //     },
  //     onCallAccepted: (callerId: string) => {
  //       console.log("📞 Call accepted by:", callerId);
  //     },
  //     onCallDeclined: (callerId: string) => {
  //       console.log("📞 Call declined by:", callerId);
  //     },
  //     onCallEnded: (callerId: string) => {
  //       console.log("📞 Call ended by:", callerId);
  //     },
  //   }),
  //   []
  // );

  // const videoCall = useVideoCall(videoCallEvents);

  // const [isFullscreen, setIsFullscreen] = useState(false);

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
            console.log(
              `👥 Members:`,
              members?.map((m) => ({ user_id: m.user_id, name: m.name }))
            );

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
      console.log("📞 Starting video call to user ID:", conversation.other_user_id);
      console.log("📞 Current sender ID:", sender.id);
      console.log("📞 Conversation details:", {
        conversation_id: conversation.conversation_id,
        other_user_id: conversation.other_user_id,
        other_user_name: conversation.other_user_name,
      });
      // Use global video call manager instead
      window.dispatchEvent(new CustomEvent('startVideoCall', {
        detail: {
          targetUserId: conversation.other_user_id.toString(),
          isVideoCall: true,
          callerName: conversation.other_user_name
        }
      }));
    } else {
      console.log("📞 Cannot start video call:", { isGroup, other_user_id: conversation.other_user_id });
    }
  };

  const handleStartVoiceCall = () => {
    if (!isGroup && conversation.other_user_id) {
      console.log("📞 Starting voice call to user ID:", conversation.other_user_id);
      console.log("📞 Current sender ID:", sender.id);
      // Use global video call manager instead
      window.dispatchEvent(new CustomEvent('startVideoCall', {
        detail: {
          targetUserId: conversation.other_user_id.toString(),
          isVideoCall: false,
          callerName: conversation.other_user_name
        }
      }));
    } else {
      console.log("📞 Cannot start voice call:", { isGroup, other_user_id: conversation.other_user_id });
    }
  };

  // Group call handlers
  const handleStartGroupVideoCall = () => {
    if (isGroup && conversation.conversation_id) {
      console.log("📞 Starting group video call for group:", conversation.conversation_id);
      groupCall.startGroupCall(conversation.conversation_id, 'video');
    }
  };

  const handleStartGroupVoiceCall = () => {
    if (isGroup && conversation.conversation_id) {
      console.log("📞 Starting group voice call for group:", conversation.conversation_id);
      groupCall.startGroupCall(conversation.conversation_id, 'audio');
    }
  };

  // Video call handlers moved to GlobalVideoCallManager
  // const handleAcceptCall = () => {
  //   videoCall.acceptCall();
  // };

  // const handleDeclineCall = () => {
  //   videoCall.declineCall();
  // };

  // const handleEndCall = () => {
  //   videoCall.endCall();
  // };

  // const handleToggleVideo = () => {
  //   videoCall.toggleVideo();
  // };

  // const handleToggleAudio = () => {
  //   videoCall.toggleAudio();
  // };

  // const handleToggleFullscreen = () => {
  //   setIsFullscreen(!isFullscreen);
  // };

  // ----- JSX Render -----
  return (
    <>
      <div
        // Mobile: Full screen, Desktop: Fixed bottom-right chat window
        className={cn(
          "fixed z-40 flex flex-col overflow-hidden border bg-card shadow-2xl transition-all duration-300 ease-soft",
          // Mobile styles (default)
          "inset-0 rounded-none max-h-none h-[80vh] max-w-full",
          // Desktop styles (md+) - Fixed positioning to bottom (right is handled by style prop)
          "md:fixed md:bottom-4 md:top-auto md:left-auto md:w-80 md:h-[480px] md:rounded-2xl md:max-h-[480px] md:max-w-80"
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
          onStartGroupVideoCall={handleStartGroupVideoCall}
          onStartGroupVoiceCall={handleStartGroupVoiceCall}
          onShowGroupInfo={setShowGroupInfo}
          onShowGroupSettings={setShowGroupSettings}
        />

        {/* Message list - Enhanced for groups and mobile */}
        <MessengerContent
          messagesContainerRef={messagesContainerRef}
          bottomRef={bottomRef}
          messages={messages}
          senderId={sender.id}
          senderAvatar={sender.avatar_url}
          isLoadingMessages={isLoadingMessages}
          hasMoreMessages={hasMoreMessages}
          isInitialLoad={isInitialLoad}
          hasUserLoadedMore={hasUserLoadedMore}
          totalMessageCount={totalMessageCount}
          loadError={loadError}
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
          onRetryLoadMessages={retryLoadMessages}
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGroupInfo(false)}>
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGroupSettings(false)}>
          <div className="bg-card rounded-lg md:rounded-xl max-w-md w-full border shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-4">Cài đặt nhóm</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-6">
                Bạn là <span className="font-medium text-primary">{currentUserRole === "admin" ? "Quản trị viên" : "Điều hành viên"}</span>
              </p>
              <Button onClick={() => setShowGroupSettings(false)} className="w-full" size="lg">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Group Video Call Component */}
      {groupCall.callState.isActive && groupCall.currentCall && (
        <GroupVideoCall
          call={groupCall.currentCall}
          currentUserId={sender.id || 0}
          localStream={groupCall.localStream || undefined}
          remoteStreams={groupCall.remoteStreams}
          isLocalAudioEnabled={groupCall.callState.isLocalAudioEnabled}
          isLocalVideoEnabled={groupCall.callState.isLocalVideoEnabled}
          connectionStates={groupCall.connectionStates}
          callState={groupCall.callState}
          onEndCall={groupCall.leaveGroupCall}
          onToggleAudio={groupCall.toggleAudio}
          onToggleVideo={groupCall.toggleVideo}
        />
      )}

      {/* Incoming Group Call Dialog - Enhanced Design */}
      {groupCall.callState.isIncomingCall && groupCall.incomingCallData && (
        <div className="fixed inset-0 bg-gradient-to-br from-background/95 via-background/90 to-muted/80 backdrop-blur-md z-50 flex items-center justify-center p-4 video-call-backdrop">
          <div className="relative max-w-sm w-full">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-success/10 to-info/20 rounded-3xl blur-xl opacity-60"></div>
            <div className="absolute inset-1 bg-gradient-to-br from-card/90 to-card/95 rounded-2xl backdrop-blur-sm border border-border/50"></div>
            
            {/* Main content */}
            <div className="relative p-8 text-center">
              {/* Animated avatar section */}
              <div className="relative mb-8 flex items-center justify-center">
                {/* Multi-layer animation rings */}
                <div className="absolute inset-0 w-32 h-32 rounded-full bg-primary/20 animate-ping"></div>
                <div className="absolute inset-2 w-28 h-28 rounded-full bg-success/15 animate-ping" style={{ animationDelay: "0.5s" }}></div>
                <div className="absolute inset-4 w-24 h-24 rounded-full bg-info/20 animate-pulse" style={{ animationDelay: "1s" }}></div>
                
                {/* Avatar container */}
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-success to-info flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-2xl border-4 border-background/20">
                  <Phone className="w-10 h-10 animate-pulse" />
                </div>
                
                {/* Video call indicator */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Call information */}
              <div className="space-y-3 mb-8">
                <h3 className="text-2xl font-bold text-foreground tracking-wide" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                  {t('incomingCall')}
                </h3>
                <p className="text-lg font-semibold text-foreground/90">
                  {groupCall.incomingCallData.call?.group_name || t('groupVideoCall')}
                </p>
                <p className="text-sm text-muted-foreground font-medium animate-pulse">
                  {groupCall.incomingCallData.call?.initiator_name || 'Someone'} {t('isCalling')}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={groupCall.declineIncomingCall}
                  className="flex-1 h-14 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border-2 border-destructive/30 hover:border-destructive rounded-2xl transition-all duration-300 hover:scale-105 video-call-button group"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-10 h-10 bg-destructive/20 group-hover:bg-destructive-foreground/20 rounded-full flex items-center justify-center transition-all duration-300">
                      <PhoneOff className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">{t('declineCall')}</span>
                  </div>
                </Button>
                
                <Button
                  onClick={groupCall.acceptIncomingCall}
                  className="flex-1 h-14 bg-success hover:bg-success/90 text-success-foreground rounded-2xl transition-all duration-300 hover:scale-105 video-call-button group shadow-lg hover:shadow-success/25"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-10 h-10 bg-success-foreground/20 group-hover:bg-success-foreground/30 rounded-full flex items-center justify-center transition-all duration-300">
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">{t('acceptCall')}</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Component - Handled by GlobalVideoCallManager */}
      {/* All video calls are now managed globally */}
    </>
  );
}
