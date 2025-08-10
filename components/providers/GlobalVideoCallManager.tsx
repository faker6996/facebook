"use client";

import { useEffect, useState } from "react";
import { useSignalR } from "@/contexts/SignalRContext";
import VideoCall from "@/components/video-call/VideoCall";
import useVideoCall from "@/hooks/useVideoCall";
import { callApi } from "@/lib/utils/api-client";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";

interface CallState {
  isCallActive: boolean;
  isIncomingCall: boolean;
  isOutgoingCall: boolean;
  callerName?: string;
  callerId?: string;
  conversationId?: string;
}

export default function GlobalVideoCallManager() {
  const { isConnected } = useSignalR();
  const [callState, setCallState] = useState<CallState>({
    isCallActive: false,
    isIncomingCall: false,
    isOutgoingCall: false,
  });

  const videoCallEvents = {
    onIncomingCall: async (callerId: string, callerName: string, conversationId?: string) => {
      // Get caller info if needed
      let displayName = callerName;
      if (!displayName && callerId) {
        try {
          const userResponse = await callApi<any>(`${API_ROUTES.USER.LIST}?id=${callerId}`, HTTP_METHOD_ENUM.GET);
          displayName = userResponse?.name || userResponse?.user_name || userResponse?.email || "Unknown User";
        } catch (error) {
          displayName = "Unknown User";
        }
      }

      setCallState({
        isCallActive: true,
        isIncomingCall: true,
        isOutgoingCall: false,
        callerName: displayName,
        callerId,
        conversationId,
      });
    },

    onCallAccepted: () => {
      setCallState((prev) => ({
        ...prev,
        isIncomingCall: false,
        isOutgoingCall: false,
      }));
    },

    onCallEnded: () => {
      setCallState({
        isCallActive: false,
        isIncomingCall: false,
        isOutgoingCall: false,
      });
    },

    onCallDeclined: () => {
      setCallState({
        isCallActive: false,
        isIncomingCall: false,
        isOutgoingCall: false,
      });
    },
  };

  const {
    acceptCall: originalAcceptCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
    callState: webRTCCallState,
    localStream,
    remoteStream,
    startCall,
  } = useVideoCall(videoCallEvents, true); // Mark as global

  // Custom accept call wrapper
  const acceptCall = async () => {
    await originalAcceptCall();

    // Update local state to active call (not incoming anymore)
    setCallState((prev) => ({
      ...prev,
      isIncomingCall: false,
      isOutgoingCall: false,
    }));
  };

  // Listen for custom events from messenger to start calls
  useEffect(() => {
    const handleStartCall = (event: CustomEvent) => {
      const { targetUserId, isVideoCall, callerName } = event.detail;

      // Update local state for outgoing call
      setCallState({
        isCallActive: true,
        isIncomingCall: false,
        isOutgoingCall: true,
        callerName: callerName || "Unknown",
        callerId: targetUserId,
      });

      // Start the actual call
      startCall(targetUserId, isVideoCall);
    };

    window.addEventListener("startVideoCall", handleStartCall as EventListener);
    return () => window.removeEventListener("startVideoCall", handleStartCall as EventListener);
  }, [startCall]);

  // Sync WebRTC call state with local state
  useEffect(() => {
    if (webRTCCallState) {
      setCallState((prev) => ({
        ...prev,
        isCallActive: webRTCCallState.isCallActive || prev.isCallActive,
      }));
    }
  }, [webRTCCallState]);

  // Only render when there's an active call
  if (!callState.isCallActive) {
    return null;
  }

  return (
    <VideoCall
      isActive={callState.isCallActive}
      isIncoming={callState.isIncomingCall}
      isOutgoing={callState.isOutgoingCall}
      callerName={callState.callerName || "Unknown"}
      callerAvatar={"/avatar.png"} // Default avatar
      onAccept={acceptCall}
      onDecline={declineCall}
      onEnd={endCall}
      onToggleVideo={toggleVideo}
      onToggleAudio={toggleAudio}
      isVideoEnabled={localStream ? localStream.getVideoTracks().length > 0 : false}
      isAudioEnabled={localStream ? localStream.getAudioTracks().some((t) => t.enabled) : false}
      localStream={localStream || undefined}
      remoteStream={remoteStream || undefined}
    />
  );
}
