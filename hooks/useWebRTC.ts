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
  handleOffer: (offer: RTCSessionDescriptionInit, callerId: string, callerName: string, callerAvatar?: string, isVideoCall?: boolean) => Promise<boolean>;
  handleAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  handleIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  
  // Events
  onCallOffer?: (offer: RTCSessionDescriptionInit, targetUserId: string, isVideoCall?: boolean) => void;
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
    onCallOffer?: (offer: RTCSessionDescriptionInit, targetUserId: string, isVideoCall?: boolean) => void;
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

  // Check camera availability
  const checkCameraAvailability = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      return videoDevices.length > 0;
    } catch (error) {
      console.error('Error enumerating devices:', error);
      return false;
    }
  }, []);

  // Get user media with enhanced error handling
  const getUserMedia = useCallback(async (video: boolean = true, audio: boolean = true) => {
    try {
      // Check for camera availability if video is requested
      if (video) {
        const hasCameraDevice = await checkCameraAvailability();
        if (!hasCameraDevice) {
          video = false;
        }
      }

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
    } catch (error: any) {
      console.error('Error accessing media devices:', error);
      
      // Handle specific camera errors
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        if (video && audio) {
          // Retry with audio only
          try {
            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
              }
            });
            
            localStreamRef.current = audioOnlyStream;
            setLocalStream(audioOnlyStream);
            return audioOnlyStream;
          } catch (audioError) {
            console.error('Audio-only fallback failed:', audioError);
            throw new Error('No media devices available');
          }
        }
      } else if (error.name === 'NotAllowedError') {
        throw new Error('Camera and microphone permissions denied');
      } else if (error.name === 'NotReadableError') {
        throw new Error('Camera is already in use by another application');
      } else if (error.name === 'ConstraintError' || error.name === 'OverconstrainedError') {
        if (video) {
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({
              video: true, // Basic video constraints
              audio: audio ? {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
              } : false
            });
            
            localStreamRef.current = basicStream;
            setLocalStream(basicStream);
            return basicStream;
          } catch (basicError) {
            console.error('Basic constraints fallback failed:', basicError);
            throw new Error('Camera constraints cannot be satisfied');
          }
        }
      }
      
      throw error;
    }
  }, [checkCameraAvailability]);

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
      
      // Update video state based on actual stream (in case of camera fallback)
      const hasVideo = stream.getVideoTracks().length > 0;
      if (isVideoCall && !hasVideo) {
        setCallState(prev => ({
          ...prev,
          isVideoEnabled: false
        }));
      }
      
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
      onSignalingSend?.onCallOffer?.(offer, targetUserId, isVideoCall);
      
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
    callerAvatar?: string,
    isVideoCall?: boolean
  ): Promise<boolean> => {
    try {
      targetUserIdRef.current = callerId;
      
      // Check if this is a renegotiation (call already active)
      const isRenegotiation = callState.isCallActive && peerConnectionRef.current;
      
      if (isRenegotiation) {
        const pc = peerConnectionRef.current!;
        
        // Set remote description
        await pc.setRemoteDescription(offer);
        
        // Create and send answer automatically for renegotiation
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        onSignalingSend?.onCallAnswer?.(answer, targetUserIdRef.current);
        
        // Update video state if changed, but preserve other call states
        if (isVideoCall !== undefined) {
          setCallState(prev => ({
            ...prev,
            isVideoEnabled: isVideoCall,
            // Ensure call remains active and not treated as incoming
            isCallActive: true,
            isIncomingCall: false,
            isOutgoingCall: false
          }));
        }
        
        return true; // Indicate this was a renegotiation
      }
      
      // Handle as new incoming call
      setCallState(prev => ({
        ...prev,
        isIncomingCall: true,
        isCallActive: true,
        callerId,
        callerName,
        callerAvatar,
        isVideoEnabled: isVideoCall !== undefined ? isVideoCall : true
      }));

      // Initialize peer connection for new call
      const pc = initializePeerConnection();
      
      // Set remote description
      await pc.setRemoteDescription(offer);
      
      return false; // Indicate this was a new call
    } catch (error) {
      console.error('Error handling offer:', error);
      declineCall();
      return false;
    }
  }, [callState.isCallActive, callState.isVideoEnabled, initializePeerConnection, onSignalingSend]);

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) return;

      // Get user media
      const stream = await getUserMedia(callState.isVideoEnabled, true);
      
      // Update video state based on actual stream (in case of camera fallback)
      const hasVideo = stream.getVideoTracks().length > 0;
      if (callState.isVideoEnabled && !hasVideo) {
        setCallState(prev => ({
          ...prev,
          isVideoEnabled: false
        }));
      }
      
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
  const toggleVideo = useCallback(async () => {
    if (!localStreamRef.current) return;
    
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    
    if (videoTrack) {
      // If we have a video track, toggle it
      const willEnable = !videoTrack.enabled;
      videoTrack.enabled = willEnable;
      
      setCallState(prev => ({
        ...prev,
        isVideoEnabled: willEnable
      }));
    } else if (callState.isCallActive) {
      // If no video track but user wants to enable video, check camera availability
      try {
        const hasCameraDevice = await checkCameraAvailability();
        if (!hasCameraDevice) {
          return;
        }
        
        // Try to add video track
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });
        
        const newVideoTrack = videoStream.getVideoTracks()[0];
        if (newVideoTrack && peerConnectionRef.current) {
          // Add video track to existing stream (don't create new stream)
          localStreamRef.current.addTrack(newVideoTrack);
          
          // Force React re-render with same stream reference but new tracks
          setLocalStream(null);
          setTimeout(() => setLocalStream(localStreamRef.current), 0);
          
          // Add track to peer connection
          const sender = peerConnectionRef.current.addTrack(newVideoTrack, localStreamRef.current);
          
          // Trigger renegotiation to inform peer about new video track
          try {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            
            // Send updated offer to peer (send as renegotiation, not new call)
            onSignalingSend?.onCallOffer?.(offer, targetUserIdRef.current, true);
          } catch (renegotiationError) {
            console.error('Error during renegotiation:', renegotiationError);
            // Remove track on failure
            peerConnectionRef.current.removeTrack(sender);
            localStreamRef.current.removeTrack(newVideoTrack);
            newVideoTrack.stop();
          }
          
          setCallState(prev => ({
            ...prev,
            isVideoEnabled: true
          }));
        }
      } catch (error: any) {
        console.error('Error enabling video:', error);
        
        // Handle specific errors
        if (error.name === 'NotAllowedError') {
          // Camera permission denied for video upgrade
        } else if (error.name === 'NotFoundError') {
          // No camera devices found for video upgrade
        }
      }
    }
  }, [callState.isCallActive, callState.isVideoEnabled, checkCameraAvailability]);

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