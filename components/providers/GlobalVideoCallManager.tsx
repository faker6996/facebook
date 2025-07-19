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

  console.log('🔔 GlobalVideoCallManager - current callState:', callState);

  const videoCallEvents = {
    onIncomingCall: async (callerId: string, callerName: string, conversationId?: string) => {
      console.log('🔔 Global incoming call from:', callerName);
      
      // Get caller info if needed
      let displayName = callerName;
      if (!displayName && callerId) {
        try {
          const userResponse = await callApi<any>(`${API_ROUTES.USER.LIST}?id=${callerId}`, HTTP_METHOD_ENUM.GET);
          displayName = userResponse?.name || userResponse?.user_name || userResponse?.email || 'Unknown User';
        } catch (error) {
          console.error('Failed to get caller info:', error);
          displayName = 'Unknown User';
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
      console.log('📞 Call accepted globally');
      setCallState(prev => ({
        ...prev,
        isIncomingCall: false,
        isOutgoingCall: false,
      }));
    },

    onCallEnded: () => {
      console.log('📴 Call ended globally');
      setCallState({
        isCallActive: false,
        isIncomingCall: false,
        isOutgoingCall: false,
      });
    },

    onCallDeclined: () => {
      console.log('📵 Call declined globally');
      setCallState({
        isCallActive: false,
        isIncomingCall: false,
        isOutgoingCall: false,
      });
    }
  };

  const { 
    acceptCall: originalAcceptCall, 
    declineCall, 
    endCall, 
    toggleAudio, 
    toggleVideo, 
    callState: webRTCCallState,
    localStream,
    remoteStream
  } = useVideoCall(videoCallEvents, true); // Mark as global

  // Custom accept call wrapper
  const acceptCall = async () => {
    console.log('🔔 GlobalVideoCallManager accepting call...');
    await originalAcceptCall();
    
    // Update local state to active call (not incoming anymore)
    setCallState(prev => ({
      ...prev,
      isIncomingCall: false,
      isOutgoingCall: false,
    }));
  };

  // Sync WebRTC call state with local state
  useEffect(() => {
    if (webRTCCallState) {
      setCallState(prev => ({
        ...prev,
        isCallActive: webRTCCallState.isCallActive || prev.isCallActive,
      }));
    }
  }, [webRTCCallState]);

  // Only render when there's an active call
  if (!callState.isCallActive) {
    return null;
  }

  console.log('🔔 GlobalVideoCallManager rendering with state:', {
    isCallActive: callState.isCallActive,
    isIncomingCall: callState.isIncomingCall,
    isOutgoingCall: callState.isOutgoingCall,
    callerName: callState.callerName,
    hasLocalStream: !!localStream,
    hasRemoteStream: !!remoteStream
  });

  return (
    <VideoCall
      isActive={callState.isCallActive}
      isIncoming={callState.isIncomingCall}
      isOutgoing={callState.isOutgoingCall}
      callerName={callState.callerName || 'Unknown'}
      callerAvatar={'/avatar.png'} // Default avatar
      onAccept={acceptCall}
      onDecline={declineCall}
      onEnd={endCall}
      onToggleVideo={toggleVideo}
      onToggleAudio={toggleAudio}
      isVideoEnabled={webRTCCallState.isVideoEnabled}
      isAudioEnabled={webRTCCallState.isAudioEnabled}
      localStream={localStream || undefined}
      remoteStream={remoteStream || undefined}
    />
  );
}