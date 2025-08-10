"use client";

// ----- Imports -----
import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  const [hasActiveGroupCall, setHasActiveGroupCall] = useState(false);
  const [activeCallInitiatorId, setActiveCallInitiatorId] = useState<number | null>(null);

  // Memoize expensive calculations
  const isGroup = useMemo(() => conversation.is_group === true, [conversation.is_group]);

  // Group call is now handled completely by GlobalGroupVideoCallManager
  // No local instance needed - everything goes through global instance

  // Listen for global group call state changes to update active call indicator
  useEffect(() => {
    const handleCallStart = (event: any) => {
      const eventGroupId = event.detail?.groupId;
      
      // Only update if this is for our group
      if (isGroup && eventGroupId && Number(eventGroupId) === Number(conversation.conversation_id)) {
        setHasActiveGroupCall(true);
      }
    };

    const handleCallEnd = (event: any) => {
      const eventGroupId = event.detail?.groupId;
      
      // Only update if this is for our group
      if (isGroup && eventGroupId && Number(eventGroupId) === Number(conversation.conversation_id)) {
        setHasActiveGroupCall(false);
        setActiveCallInitiatorId(null);
      }
    };

    window.addEventListener('globalGroupCallStarted', handleCallStart);
    window.addEventListener('globalGroupCallEnded', handleCallEnd);

    return () => {
      window.removeEventListener('globalGroupCallStarted', handleCallStart);
      window.removeEventListener('globalGroupCallEnded', handleCallEnd);
    };
  }, [isGroup, conversation.conversation_id]);

  // Group call joining is now handled by GlobalGroupVideoCallManager


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

            const members = await callApi<GroupMember[]>(API_ROUTES.CHAT_SERVER.GROUP_MEMBERS(conversation.conversation_id!), HTTP_METHOD_ENUM.GET);

            setGroupMembers(members || []);

            const currentMember = members?.find((m) => m.user_id === currentUser?.id);
            if (currentMember) {
              setCurrentUserRole(currentMember.role);
            }

            // Check for active group call
            try {
              const activeCall = await callApi<any>(
                API_ROUTES.CHAT_SERVER.GET_ACTIVE_GROUP_CALL(conversation.conversation_id),
                HTTP_METHOD_ENUM.GET
              );
              // More strict validation - check both id exists and is not null/empty
              const hasValidActiveCall = activeCall && activeCall.id && String(activeCall.id).trim() !== '';
              setHasActiveGroupCall(!!hasValidActiveCall);
              setActiveCallInitiatorId(hasValidActiveCall ? (activeCall.initiator_id || null) : null);
            } catch (error) {
              setHasActiveGroupCall(false);
              setActiveCallInitiatorId(null);
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

  // Reset active call state when conversation changes
  useEffect(() => {
    setHasActiveGroupCall(false);
    setActiveCallInitiatorId(null);
  }, [conversation.conversation_id]);

  // Video call handlers - memoized to prevent re-creation
  const handleStartVideoCall = useCallback(() => {
    if (!isGroup && conversation.other_user_id) {
      // Use global video call manager instead
      window.dispatchEvent(new CustomEvent('startVideoCall', {
        detail: {
          targetUserId: conversation.other_user_id.toString(),
          isVideoCall: true,
          callerName: conversation.other_user_name
        }
      }));
    } else {
    }
  }, [isGroup, conversation.other_user_id, conversation.conversation_id, conversation.other_user_name, sender.id]);

  const handleStartVoiceCall = useCallback(() => {
    if (!isGroup && conversation.other_user_id) {
      // Use global video call manager instead
      window.dispatchEvent(new CustomEvent('startVideoCall', {
        detail: {
          targetUserId: conversation.other_user_id.toString(),
          isVideoCall: false,
          callerName: conversation.other_user_name
        }
      }));
    } else {
    }
  }, [isGroup, conversation.other_user_id, conversation.other_user_name, sender.id]);

  // Group call handlers - Following 2-person call pattern with global dispatch - memoized
  const handleStartGroupVideoCall = useCallback(() => {
    if (isGroup && conversation.conversation_id) {
      
      // Dispatch to global manager (like 2-person call pattern)
      window.dispatchEvent(new CustomEvent('startGlobalGroupCall', {
        detail: {
          groupId: conversation.conversation_id,
          groupName: conversation.name,
          callType: 'video'
        }
      }));
    }
  }, [isGroup, conversation.conversation_id, conversation.name]);

  const handleStartGroupVoiceCall = useCallback(() => {
    if (isGroup && conversation.conversation_id) {
      
      // Dispatch to global manager (like 2-person call pattern)
      window.dispatchEvent(new CustomEvent('startGlobalGroupCall', {
        detail: {
          groupId: conversation.conversation_id,
          groupName: conversation.name,
          callType: 'audio'
        }
      }));
    }
  }, [isGroup, conversation.conversation_id, conversation.name]);

  const handleJoinGroupCall = useCallback(() => {
    if (isGroup && conversation.conversation_id) {
      
      // Check for active call and join it
      callApi<any>(
        API_ROUTES.CHAT_SERVER.GET_ACTIVE_GROUP_CALL(conversation.conversation_id),
        HTTP_METHOD_ENUM.GET
      ).then(activeCall => {
        if (activeCall && activeCall.id) {
          // Dispatch join event to global manager
          window.dispatchEvent(new CustomEvent('joinGlobalGroupCall', {
            detail: {
              callId: activeCall.id,
              groupId: conversation.conversation_id,
              groupName: conversation.name,
              callType: activeCall.call_type
            }
          }));
        }
      }).catch(error => {
        console.error('Failed to get active call for join:', error);
      });
    }
  }, [isGroup, conversation.conversation_id, conversation.name]);

  // Handler riêng cho việc reconnect khi user là initiator
  const handleReconnectGroupCall = useCallback(() => {
    if (isGroup && conversation.conversation_id) {
      
      // Dispatch start event để trigger reconnect logic trong useGroupCall
      window.dispatchEvent(new CustomEvent('startGlobalGroupCall', {
        detail: {
          groupId: conversation.conversation_id,
          groupName: conversation.name,
          callType: 'video' // Default to video, sẽ được override trong useGroupCall nếu cần
        }
      }));
    }
  }, [isGroup, conversation.conversation_id, conversation.name]);

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
          currentUserId={sender.id}
          onClose={onClose}
          onStartVideoCall={handleStartVideoCall}
          onStartVoiceCall={handleStartVoiceCall}
          onStartGroupVideoCall={handleStartGroupVideoCall}
          onStartGroupVoiceCall={handleStartGroupVoiceCall}
          onShowGroupInfo={setShowGroupInfo}
          onShowGroupSettings={setShowGroupSettings}
          hasActiveGroupCall={hasActiveGroupCall}
          activeCallInitiatorId={activeCallInitiatorId}
          onJoinGroupCall={handleJoinGroupCall}
          onReconnectGroupCall={handleReconnectGroupCall}
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
          getSenderName={useMemo(() => (senderId: number) => {
            if (!isGroup) return "";
            const member = groupMembers.find((m) => m.user_id === senderId);
            return member?.name || "Unknown User";
          }, [isGroup, groupMembers])}
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
          onSendMessage={useCallback((e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            sendMessage(input, selectedFiles, setInput, setSelectedFiles, setIsUploading);
          }, [sendMessage, input, selectedFiles, setInput, setSelectedFiles, setIsUploading])}
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

      {/* Group Video Call Component - Now handled by GlobalGroupVideoCallManager */}
      {/* Local GroupVideoCall removed to prevent duplicate rendering */}

      {/* Incoming Group Call Dialog - Now handled by GlobalGroupCallModal */}

      {/* Video Call Component - Handled by GlobalVideoCallManager */}
      {/* All video calls are now managed globally */}
    </>
  );
}
