"use client";

import { useRef, useState, useCallback, useEffect } from 'react';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export interface CallState {
  isCallActive: boolean;
  isIncomingCall: boolean;
  isOutgoingCall: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  callerId?: string;
  callerName?: string;
  callerAvatar?: string;
}

export interface UseWebRTCReturn {
  // State
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  
  // Actions
  startCall: (targetUserId: string, isVideoCall?: boolean) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  endCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  
  // Signaling (to be integrated with SignalR)
  handleOffer: (offer: RTCSessionDescriptionInit, callerId: string, callerName: string, callerAvatar?: string) => Promise<void>;
  handleAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  handleIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  
  // Events
  onCallOffer?: (offer: RTCSessionDescriptionInit, targetUserId: string) => void;
  onCallAnswer?: (answer: RTCSessionDescriptionInit, targetUserId: string) => void;
  onIceCandidate?: (candidate: RTCIceCandidateInit, targetUserId: string) => void;
  onCallEnd?: (targetUserId: string) => void;
}

const defaultConfig: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // TURN server sẽ được cấu hình sau
  ]
};

export default function useWebRTC(
  config: WebRTCConfig = defaultConfig,
  onSignalingSend?: {
    onCallOffer?: (offer: RTCSessionDescriptionInit, targetUserId: string) => void;
    onCallAnswer?: (answer: RTCSessionDescriptionInit, targetUserId: string) => void;
    onIceCandidate?: (candidate: RTCIceCandidateInit, targetUserId: string) => void;
    onCallEnd?: (targetUserId: string) => void;
  }
): UseWebRTCReturn {
  // Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const targetUserIdRef = useRef<string>('');
  
  // State
  const [callState, setCallState] = useState<CallState>({
    isCallActive: false,
    isIncomingCall: false,
    isOutgoingCall: false,
    isVideoEnabled: true,
    isAudioEnabled: true,
  });
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(config);
    peerConnectionRef.current = pc;

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
      
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };

    // Handle incoming stream
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      remoteStreamRef.current = stream;
      setRemoteStream(stream);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && targetUserIdRef.current) {
        onSignalingSend?.onIceCandidate?.(event.candidate.toJSON(), targetUserIdRef.current);
      }
    };

    return pc;
  }, [config, onSignalingSend]);

  // Get user media
  const getUserMedia = useCallback(async (video: boolean = true, audio: boolean = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  // Start outgoing call
  const startCall = useCallback(async (targetUserId: string, isVideoCall: boolean = true) => {
    try {
      targetUserIdRef.current = targetUserId;
      
      setCallState(prev => ({
        ...prev,
        isOutgoingCall: true,
        isCallActive: true,
        isVideoEnabled: isVideoCall,
        isAudioEnabled: true
      }));

      // Get user media
      const stream = await getUserMedia(isVideoCall, true);
      
      // Initialize peer connection
      const pc = initializePeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send offer through signaling
      onSignalingSend?.onCallOffer?.(offer, targetUserId);
      
    } catch (error) {
      console.error('Error starting call:', error);
      endCall();
    }
  }, [getUserMedia, initializePeerConnection, onSignalingSend]);

  // Handle incoming call offer
  const handleOffer = useCallback(async (
    offer: RTCSessionDescriptionInit, 
    callerId: string, 
    callerName: string, 
    callerAvatar?: string
  ) => {
    try {
      targetUserIdRef.current = callerId;
      
      setCallState(prev => ({
        ...prev,
        isIncomingCall: true,
        isCallActive: true,
        callerId,
        callerName,
        callerAvatar,
        isVideoEnabled: offer.type === 'offer' // Assume video if it's an offer
      }));

      // Initialize peer connection
      const pc = initializePeerConnection();
      
      // Set remote description
      await pc.setRemoteDescription(offer);
      
    } catch (error) {
      console.error('Error handling offer:', error);
      declineCall();
    }
  }, [initializePeerConnection]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      // Get user media
      const stream = await getUserMedia(callState.isVideoEnabled, true);
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer through signaling
      onSignalingSend?.onCallAnswer?.(answer, targetUserIdRef.current);

      setCallState(prev => ({
        ...prev,
        isIncomingCall: false,
        isOutgoingCall: false
      }));
      
    } catch (error) {
      console.error('Error accepting call:', error);
      endCall();
    }
  }, [callState.isVideoEnabled, getUserMedia, onSignalingSend]);

  // Handle call answer
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      await pc.setRemoteDescription(answer);
      
      setCallState(prev => ({
        ...prev,
        isOutgoingCall: false
      }));
      
    } catch (error) {
      console.error('Error handling answer:', error);
      endCall();
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      await pc.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);

  // Decline call
  const declineCall = useCallback(() => {
    onSignalingSend?.onCallEnd?.(targetUserIdRef.current);
    endCall();
  }, [onSignalingSend]);

  // End call
  const endCall = useCallback(() => {
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    // Clear remote stream
    remoteStreamRef.current = null;

    // Reset state
    setCallState({
      isCallActive: false,
      isIncomingCall: false,
      isOutgoingCall: false,
      isVideoEnabled: true,
      isAudioEnabled: true,
    });
    
    setLocalStream(null);
    setRemoteStream(null);
    setConnectionState('new');
    
    // Notify signaling if there's a target user
    if (targetUserIdRef.current) {
      onSignalingSend?.onCallEnd?.(targetUserIdRef.current);
      targetUserIdRef.current = '';
    }
  }, [onSignalingSend]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState(prev => ({
          ...prev,
          isVideoEnabled: videoTrack.enabled
        }));
      }
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({
          ...prev,
          isAudioEnabled: audioTrack.enabled
        }));
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    // State
    callState,
    localStream,
    remoteStream,
    connectionState,
    
    // Actions
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleVideo,
    toggleAudio,
    
    // Signaling handlers
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    
    // Events (passed through)
    onCallOffer: onSignalingSend?.onCallOffer,
    onCallAnswer: onSignalingSend?.onCallAnswer,
    onIceCandidate: onSignalingSend?.onIceCandidate,
    onCallEnd: onSignalingSend?.onCallEnd,
  };
}