"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { useSignalR } from "@/contexts/SignalRContext";
import useWebRTC from "./useWebRTC";
import { callApi } from "@/lib/utils/api-client";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";

export interface VideoCallEvents {
  onIncomingCall?: (callerId: string, callerName: string, callerAvatar?: string) => void;
  onCallAccepted?: (callerId: string) => void;
  onCallDeclined?: (callerId: string) => void;
  onCallEnded?: (callerId: string) => void;
}

export default function useVideoCall(events?: VideoCallEvents, isGlobal: boolean = false) {
  const { connection, isConnected } = useSignalR();
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAudioOnlyFallback, setIsAudioOnlyFallback] = useState(false);

  // Fetch ICE servers from API
  useEffect(() => {
    const fetchIceServers = async () => {
      try {
        const response = await callApi<{ iceServers: RTCIceServer[] }>("/api/turn-cred", HTTP_METHOD_ENUM.GET);
        if (response?.iceServers) {
          setIceServers(response.iceServers);
        }
      } catch (error) {
        // Failed to fetch ICE servers, using defaults
      }
    };

    fetchIceServers();
  }, []);

  // Memoize WebRTC config to prevent infinite re-renders
  const webRTCConfig = useMemo(
    () => ({
      iceServers,
    }),
    [iceServers]
  );

  // Memoize signaling callbacks to prevent infinite re-renders
  const signalingCallbacks = useMemo(
    () => ({
      onCallOffer: (offer: RTCSessionDescriptionInit, targetUserId: string, isVideoCall?: boolean) => {
        if (connection && isConnected) {
          const offerString = JSON.stringify(offer);
          const callType = isVideoCall ? "video" : "audio";
          connection
            .invoke("SendCallOffer", targetUserId, offerString, callType)
            .catch((err) => console.error("Error sending call offer:", err));
        } else {
        }
      },

      onCallAnswer: (answer: RTCSessionDescriptionInit, targetUserId: string) => {
        if (connection && isConnected) {
          const answerString = JSON.stringify(answer);
          connection
            .invoke("SendCallAnswer", targetUserId, answerString)
            .catch((err) => console.error("Error sending call answer:", err));
        } else {
          console.error("📞 Cannot send call answer - SignalR not connected");
        }
      },

      onIceCandidate: (candidate: RTCIceCandidateInit, targetUserId: string) => {
        if (connection && isConnected) {
          const candidateString = JSON.stringify(candidate);
          connection
            .invoke("SendIceCandidate", targetUserId, candidateString)
            .catch((err) => console.error("Error sending ICE candidate:", err));
        } else {
          console.error("🧊 Cannot send ICE candidate - SignalR not connected");
        }
      },

      onCallEnd: (targetUserId: string) => {
        if (connection && isConnected) {
          connection
            .invoke("EndCall", targetUserId)
            .catch((err) => console.error("Error ending call:", err));
        } else {
          console.error("📞 Cannot end call - SignalR not connected");
        }
      },
    }),
    [connection, isConnected]
  );

  const webRTC = useWebRTC(
    // WebRTC config with TURN servers
    webRTCConfig,
    // SignalR signaling callbacks
    signalingCallbacks
  );

  // Setup SignalR event listeners
  useEffect(() => {
    if (!connection || !isConnected) {
      return;
    }

    const listenerPrefix = isGlobal ? "Global" : "Local";

    // Handle incoming call offer
    const handleCallOffer = async (callerId: string, offer: string, callType: string = "video") => {
      try {
        // Parse offer from string to RTCSessionDescriptionInit
        const offerObj = JSON.parse(offer) as RTCSessionDescriptionInit;

        // Fetch caller info to get real name
        let callerName = callerId; // fallback
        try {
          const userResponse = await callApi<any>(`/api/users?id=${callerId}`, HTTP_METHOD_ENUM.GET);
          callerName = userResponse?.name || userResponse?.user_name || userResponse?.email || callerId;
        } catch (error) {
          // Failed to fetch caller info
        }

        const isVideoCall = callType === "video";
        const isRenegotiation = await webRTC.handleOffer(offerObj, callerId, callerName, undefined, isVideoCall);

        // Only trigger onIncomingCall for new calls, not renegotiation
        if (!isRenegotiation) {
          events?.onIncomingCall?.(callerId, callerName, undefined);
        }
      } catch (error) {
        console.error("Error handling call offer:", error);
      }
    };

    // Handle call answer
    const handleCallAnswer = async (calleeId: string, answer: string) => {
      try {
        // Parse answer from string to RTCSessionDescriptionInit
        const answerObj = JSON.parse(answer) as RTCSessionDescriptionInit;

        await webRTC.handleAnswer(answerObj);
        events?.onCallAccepted?.(calleeId);
      } catch (error) {
        console.error("Error handling call answer:", error);
      }
    };

    // Handle ICE candidate
    const handleIceCandidate = async (senderId: string, candidate: string) => {
      try {
        // Parse candidate from string to RTCIceCandidateInit
        const candidateObj = JSON.parse(candidate) as RTCIceCandidateInit;

        await webRTC.handleIceCandidate(candidateObj);
      } catch (error) {
        console.error("Error handling ICE candidate:", error);
      }
    };

    // Handle call end
    const handleCallEnd = (endingUserId: string) => {
      webRTC.endCall();
      events?.onCallEnded?.(endingUserId);
    };

    // Handle call declined
    const handleCallDeclined = (callerId: string) => {
      webRTC.endCall();
      events?.onCallDeclined?.(callerId);
    };

    // Register SignalR event handlers with namespace to avoid conflicts

    // Only global handler should receive initial call offers
    if (isGlobal) {
      connection.on("ReceiveCallOffer", handleCallOffer);
    }

    connection.on("ReceiveCallAnswer", handleCallAnswer);
    connection.on("ReceiveIceCandidate", handleIceCandidate);
    connection.on("CallEnded", handleCallEnd);
    connection.on("CallDeclined", handleCallDeclined);

    // Cleanup
    return () => {
      if (isGlobal) {
        connection.off("ReceiveCallOffer", handleCallOffer);
      }
      connection.off("ReceiveCallAnswer", handleCallAnswer);
      connection.off("ReceiveIceCandidate", handleIceCandidate);
      connection.off("CallEnded", handleCallEnd);
      connection.off("CallDeclined", handleCallDeclined);
    };
  }, [connection, isConnected, webRTC, events]);

  // Enhanced start call with user info
  const startCall = useCallback(
    async (targetUserId: string, isVideoCall: boolean = true) => {
      try {
        // Reset error states
        setCameraError(null);
        setIsAudioOnlyFallback(false);

        await webRTC.startCall(targetUserId, isVideoCall);

        // Check if we actually got video after the call started
        if (isVideoCall && webRTC.localStream) {
          const hasVideo = webRTC.localStream.getVideoTracks().length > 0;
          if (!hasVideo) {
            setIsAudioOnlyFallback(true);
            setCameraError("No camera devices available - using audio-only");
          }
        }
      } catch (error: any) {
        console.error("Error starting call:", error);

        // Handle specific camera errors
        if (error.message?.includes("No media devices available")) {
          setCameraError("No camera or microphone devices available");
        } else if (error.message?.includes("Camera and microphone permissions denied")) {
          setCameraError("Camera and microphone permissions denied");
        } else if (error.message?.includes("Camera is already in use")) {
          setCameraError("Camera is already in use by another application");
        } else if (error.message?.includes("Camera constraints cannot be satisfied")) {
          setCameraError("Camera constraints cannot be satisfied");
        } else {
          setCameraError("Failed to access camera or microphone");
        }

        throw error;
      }
    },
    [webRTC, connection, isConnected]
  );

  // Enhanced accept call
  const acceptCall = useCallback(async () => {
    try {
      // Reset error states
      setCameraError(null);
      setIsAudioOnlyFallback(false);

      await webRTC.acceptCall();

      // Check if we actually got video after accepting the call
      if (webRTC.callState.isVideoEnabled && webRTC.localStream) {
        const hasVideo = webRTC.localStream.getVideoTracks().length > 0;
        if (!hasVideo) {
          setIsAudioOnlyFallback(true);
          setCameraError("No camera devices available - using audio-only");
        }
      }

      // Trigger local onCallAccepted event for the receiver
      events?.onCallAccepted?.("local");
    } catch (error: any) {
      console.error("Error accepting call:", error);

      // Handle specific camera errors
      if (error.message?.includes("No media devices available")) {
        setCameraError("No camera or microphone devices available");
      } else if (error.message?.includes("Camera and microphone permissions denied")) {
        setCameraError("Camera and microphone permissions denied");
      } else if (error.message?.includes("Camera is already in use")) {
        setCameraError("Camera is already in use by another application");
      } else if (error.message?.includes("Camera constraints cannot be satisfied")) {
        setCameraError("Camera constraints cannot be satisfied");
      } else {
        setCameraError("Failed to access camera or microphone");
      }

      throw error;
    }
  }, [webRTC, events]);

  // Enhanced decline call
  const declineCall = useCallback(() => {
    // Send decline notification through SignalR (if server supports it)
    if (connection && isConnected && webRTC.callState.callerId) {
      // Use EndCall for now since DeclineCall might not be implemented
      connection
        .invoke("EndCall", webRTC.callState.callerId)
        .catch((err) => console.error("Error sending call decline:", err));
    }

    webRTC.declineCall();
  }, [connection, isConnected, webRTC]);

  return {
    // WebRTC state and controls
    ...webRTC,

    // Enhanced methods with SignalR integration
    startCall,
    acceptCall,
    declineCall,

    // SignalR connection state
    isSignalRConnected: isConnected,

    // Camera error state
    cameraError,
    isAudioOnlyFallback,
    clearCameraError: () => setCameraError(null),
  };
}
