"use client";

import { useEffect, useCallback, useState, useMemo } from 'react';
import { useSignalR } from '@/contexts/SignalRContext';
import useWebRTC from './useWebRTC';
import { callApi } from '@/lib/utils/api-client';
import { HTTP_METHOD_ENUM } from '@/lib/constants/enum';

export interface VideoCallEvents {
  onIncomingCall?: (callerId: string, callerName: string, callerAvatar?: string) => void;
  onCallAccepted?: (callerId: string) => void;
  onCallDeclined?: (callerId: string) => void;
  onCallEnded?: (callerId: string) => void;
}

export default function useVideoCall(events?: VideoCallEvents, isGlobal: boolean = false) {
  const { connection, isConnected } = useSignalR();
  const [iceServers, setIceServers] = useState<RTCIceServer[]>([
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]);

  // Debug SignalR connection state
  useEffect(() => {
    console.log('📞 SignalR connection state changed:', {
      connection: !!connection,
      isConnected,
      connectionState: connection?.state,
      connectionId: connection?.connectionId
    });
  }, [connection, isConnected]);

  // Fetch ICE servers from API
  useEffect(() => {
    const fetchIceServers = async () => {
      try {
        const response = await callApi<{ iceServers: RTCIceServer[] }>('/api/turn-cred', HTTP_METHOD_ENUM.GET);
        if (response?.iceServers) {
          setIceServers(response.iceServers);
          console.log('🧊 ICE servers loaded:', response.iceServers);
        }
      } catch (error) {
        console.warn('Failed to fetch ICE servers, using defaults:', error);
      }
    };

    fetchIceServers();
  }, []);

  // Memoize WebRTC config to prevent infinite re-renders
  const webRTCConfig = useMemo(() => ({
    iceServers
  }), [iceServers]);

  // Memoize signaling callbacks to prevent infinite re-renders
  const signalingCallbacks = useMemo(() => ({
    onCallOffer: (offer: RTCSessionDescriptionInit, targetUserId: string) => {
      console.log('📞 Sending call offer to:', targetUserId);
      console.log('📞 Offer being sent:', offer);
      if (connection && isConnected) {
        const offerString = JSON.stringify(offer);
        console.log('📞 Offer string:', offerString);
        connection.invoke('SendCallOffer', targetUserId, offerString)
          .then(() => console.log('📞 Call offer sent successfully'))
          .catch(err => console.error('Error sending call offer:', err));
      } else {
        console.error('📞 Cannot send call offer - SignalR not connected');
        console.error('📞 Connection details:', { connection, isConnected, connectionState: connection?.state });
      }
    },
    
    onCallAnswer: (answer: RTCSessionDescriptionInit, targetUserId: string) => {
      console.log('📞 Sending call answer to:', targetUserId);
      console.log('📞 Answer being sent:', answer);
      if (connection && isConnected) {
        const answerString = JSON.stringify(answer);
        console.log('📞 Answer string:', answerString);
        connection.invoke('SendCallAnswer', targetUserId, answerString)
          .then(() => console.log('📞 Call answer sent successfully'))
          .catch(err => console.error('Error sending call answer:', err));
      } else {
        console.error('📞 Cannot send call answer - SignalR not connected');
      }
    },
    
    onIceCandidate: (candidate: RTCIceCandidateInit, targetUserId: string) => {
      console.log('🧊 Sending ICE candidate to:', targetUserId);
      console.log('🧊 Candidate being sent:', candidate);
      if (connection && isConnected) {
        const candidateString = JSON.stringify(candidate);
        console.log('🧊 Candidate string:', candidateString);
        connection.invoke('SendIceCandidate', targetUserId, candidateString)
          .then(() => console.log('🧊 ICE candidate sent successfully'))
          .catch(err => console.error('Error sending ICE candidate:', err));
      } else {
        console.error('🧊 Cannot send ICE candidate - SignalR not connected');
      }
    },
    
    onCallEnd: (targetUserId: string) => {
      console.log('📞 Ending call with:', targetUserId);
      if (connection && isConnected) {
        connection.invoke('EndCall', targetUserId)
          .then(() => console.log('📞 Call ended successfully'))
          .catch(err => console.error('Error ending call:', err));
      } else {
        console.error('📞 Cannot end call - SignalR not connected');
      }
    }
  }), [connection, isConnected]);
  
  const webRTC = useWebRTC(
    // WebRTC config with TURN servers
    webRTCConfig,
    // SignalR signaling callbacks
    signalingCallbacks
  );

  // Setup SignalR event listeners
  useEffect(() => {
    if (!connection || !isConnected) {
      console.log('📞 SignalR not ready:', { connection: !!connection, isConnected });
      return;
    }

    const listenerPrefix = isGlobal ? 'Global' : 'Local';
    console.log(`📞 Setting up ${listenerPrefix} SignalR video call listeners...`);

    // Handle incoming call offer
    const handleCallOffer = async (callerId: string, offer: string) => {
      console.log('📞 Received call offer from:', callerId);
      console.log('📞 Offer string:', offer);
      
      try {
        // Parse offer from string to RTCSessionDescriptionInit
        const offerObj = JSON.parse(offer) as RTCSessionDescriptionInit;
        console.log('📞 Parsed offer:', offerObj);
        
        // Fetch caller info to get real name
        let callerName = callerId; // fallback
        try {
          const userResponse = await callApi<any>(`/api/users?id=${callerId}`, HTTP_METHOD_ENUM.GET);
          callerName = userResponse?.name || userResponse?.user_name || userResponse?.email || callerId;
          console.log('📞 Fetched caller name:', callerName);
        } catch (error) {
          console.warn('Failed to fetch caller info:', error);
        }
        
        await webRTC.handleOffer(offerObj, callerId, callerName, undefined);
        events?.onIncomingCall?.(callerId, callerName, undefined);
      } catch (error) {
        console.error('Error handling call offer:', error);
      }
    };

    // Handle call answer
    const handleCallAnswer = async (calleeId: string, answer: string) => {
      console.log('📞 Received call answer from:', calleeId);
      console.log('📞 Answer string:', answer);
      
      try {
        // Parse answer from string to RTCSessionDescriptionInit
        const answerObj = JSON.parse(answer) as RTCSessionDescriptionInit;
        console.log('📞 Parsed answer:', answerObj);
        
        await webRTC.handleAnswer(answerObj);
        events?.onCallAccepted?.(calleeId);
      } catch (error) {
        console.error('Error handling call answer:', error);
      }
    };

    // Handle ICE candidate
    const handleIceCandidate = async (senderId: string, candidate: string) => {
      console.log('🧊 Received ICE candidate from:', senderId);
      console.log('🧊 Candidate string:', candidate);
      
      try {
        // Parse candidate from string to RTCIceCandidateInit
        const candidateObj = JSON.parse(candidate) as RTCIceCandidateInit;
        console.log('🧊 Parsed candidate:', candidateObj);
        
        await webRTC.handleIceCandidate(candidateObj);
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    };

    // Handle call end
    const handleCallEnd = (endingUserId: string) => {
      console.log('📞 Call ended by:', endingUserId);
      webRTC.endCall();
      events?.onCallEnded?.(endingUserId);
    };

    // Handle call declined
    const handleCallDeclined = (callerId: string) => {
      console.log('📞 Call declined by:', callerId);
      webRTC.endCall();
      events?.onCallDeclined?.(callerId);
    };

    // Register SignalR event handlers with namespace to avoid conflicts
    console.log(`📞 Registering ${listenerPrefix} SignalR event handlers...`);
    
    // Only global handler should receive initial call offers
    if (isGlobal) {
      connection.on('ReceiveCallOffer', handleCallOffer);
    }
    
    connection.on('ReceiveCallAnswer', handleCallAnswer);
    connection.on('ReceiveIceCandidate', handleIceCandidate);
    connection.on('CallEnded', handleCallEnd);
    connection.on('CallDeclined', handleCallDeclined);

    // Test if events are registered
    console.log('📞 SignalR event handlers registered:', [
      'ReceiveCallOffer',
      'ReceiveCallAnswer', 
      'ReceiveIceCandidate',
      'CallEnded',
      'CallDeclined'
    ]);

    // Cleanup
    return () => {
      console.log(`📞 Cleaning up ${listenerPrefix} SignalR event handlers...`);
      if (isGlobal) {
        connection.off('ReceiveCallOffer', handleCallOffer);
      }
      connection.off('ReceiveCallAnswer', handleCallAnswer);
      connection.off('ReceiveIceCandidate', handleIceCandidate);
      connection.off('CallEnded', handleCallEnd);
      connection.off('CallDeclined', handleCallDeclined);
    };
  }, [connection, isConnected, webRTC, events]);

  // Enhanced start call with user info
  const startCall = useCallback(async (targetUserId: string, isVideoCall: boolean = true) => {
    try {
      console.log('📞 Starting call to:', targetUserId, 'isVideo:', isVideoCall);
      console.log('📞 SignalR connection state:', { connection: !!connection, isConnected });
      await webRTC.startCall(targetUserId, isVideoCall);
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }, [webRTC, connection, isConnected]);

  // Enhanced accept call
  const acceptCall = useCallback(async () => {
    try {
      console.log('📞 Accepting call...');
      await webRTC.acceptCall();
      // Trigger local onCallAccepted event for the receiver
      events?.onCallAccepted?.('local');
    } catch (error) {
      console.error('Error accepting call:', error);
      throw error;
    }
  }, [webRTC, events]);

  // Enhanced decline call
  const declineCall = useCallback(() => {
    console.log('📞 Declining call...');
    
    // Send decline notification through SignalR (if server supports it)
    if (connection && isConnected && webRTC.callState.callerId) {
      // Use EndCall for now since DeclineCall might not be implemented
      connection.invoke('EndCall', webRTC.callState.callerId)
        .then(() => console.log('📞 Call declined successfully'))
        .catch(err => console.error('Error sending call decline:', err));
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
  };
}