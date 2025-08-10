"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSignalR } from '@/contexts/SignalRContext';
import { useGroupWebRTC } from './useGroupWebRTC';
import { 
  GroupCall, 
  CallParticipant, 
  GroupCallState,
  StartGroupCallRequest,
  JoinGroupCallRequest,
  ToggleMediaRequest
} from '@/lib/models/group-call';
import { callApi } from '@/lib/utils/api-client';
import { API_ROUTES } from '@/lib/constants/api-routes';
import { HTTP_METHOD_ENUM } from '@/lib/constants/enum';
import { User } from '@/lib/models/user';

interface UseGroupCallProps {
  currentUser: User;
  onCallStateChange?: (isActive: boolean) => void;
  onError?: (error: string) => void;
}

export const useGroupCall = ({
  currentUser,
  onCallStateChange,
  onError
}: UseGroupCallProps) => {
  // Debug: Add unique instance ID
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  // State
  const [callState, setCallState] = useState<GroupCallState>({
    isActive: false,
    callType: 'video',
    isIncomingCall: false,
    isOutgoingCall: false,
    isConnecting: false,
    participants: new Map(),
    remoteStreams: new Map(),
    isLocalAudioEnabled: true,
    isLocalVideoEnabled: true,
    connectionQuality: 'good'
  });

  const [currentCall, setCurrentCall] = useState<GroupCall | null>(null);
  const [incomingCallData, setIncomingCallData] = useState<any>(null);
  
  // Add error handling states like 2-person call
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAudioOnlyFallback, setIsAudioOnlyFallback] = useState(false);

  // Refs

  // Hooks
  const signalR = useSignalR();
  const groupWebRTC = useGroupWebRTC({
    localUserId: currentUser.id || 0,
    onConnectionStateChange: (participantId, state) => {
      setCallState(prev => {
        const newParticipants = new Map(prev.participants);
        const participant = newParticipants.get(participantId);
        if (participant) {
          // Update connection quality based on connection state
          const quality = state === 'connected' ? 'good' : 
                          state === 'connecting' ? 'poor' : 'disconnected';
          newParticipants.set(participantId, { ...participant, connection_quality: quality });
        }
        return { ...prev, participants: newParticipants };
      });
    },
    onRemoteStream: (participantId, stream) => {
      setCallState(prev => ({
        ...prev,
        remoteStreams: new Map(prev.remoteStreams).set(participantId, stream)
      }));
    },
    onRemoteStreamRemoved: (participantId) => {
      setCallState(prev => {
        const newStreams = new Map(prev.remoteStreams);
        newStreams.delete(participantId);
        return { ...prev, remoteStreams: newStreams };
      });
    }
  });

  // Start group call
  const startGroupCall = useCallback(async (groupId: number, callType: 'audio' | 'video') => {
    try {
      setCallState(prev => ({ 
        ...prev, 
        isOutgoingCall: true, 
        isConnecting: true,
        callType 
      }));

      // Check if there's already an active call
      try {
        const activeCall = await callApi<GroupCall>(
          API_ROUTES.CHAT_SERVER.GET_ACTIVE_GROUP_CALL(groupId),
          HTTP_METHOD_ENUM.GET
        );
        
        if (activeCall) {
          
          // Fix: Backend returns initiator_id (snake_case), not initiatorId (camelCase)
          const initiatorId = activeCall.initiator_id;
          
          // Check if current user is the initiator of the active call (type-safe comparison)
          const isInitiator = Number(initiatorId) === Number(currentUser.id);
          
          if (isInitiator) {
            
            // Initialize local media stream first
            const localStream = await groupWebRTC.initializeLocalStream(activeCall.call_type === 'video');
            
            // Set call state but keep connecting for a brief moment to show waiting screen
            setCallState(prev => ({
              ...prev,
              isActive: true,
              callId: activeCall.id,
              groupId: activeCall.group_id,
              groupName: activeCall.group_name,
              callType: activeCall.call_type,
              isOutgoingCall: false,
              isConnecting: true, // Keep true initially to show waiting screen
              localStream
            }));

            // Set connecting to false after a brief delay to show waiting screen
            setTimeout(() => {
              setCallState(prev => ({
                ...prev,
                isConnecting: false
              }));
            }, 1500); // Show waiting screen for 1.5 seconds
            
            setCurrentCall(activeCall);
            onCallStateChange?.(true);
            
            // IMPORTANT: Still need to notify other group members about the active call
            try {
              await signalR.connection?.invoke("StartGroupCall", groupId.toString(), activeCall.call_type);
            } catch (signalRError) {
              console.error(`📞 [${instanceId.current}] Failed to notify group about existing call:`, signalRError);
            }
            
            return;
          } else {
            // User is not initiator, need to join the call
            try {
              setCallState(prev => ({ ...prev, callType: activeCall.call_type }));
              await joinGroupCall(activeCall.id);
              return;
            } catch (joinError) {
              // Continue to start new call as fallback
            }
          }
        }
      } catch (error) {
        // No active call found, continue with starting new call
      }

      // Initialize local media stream with error handling like 2-person call
      let localStream: MediaStream | null = null;
      try {
        localStream = await groupWebRTC.initializeLocalStream(callType === 'video');
        setCameraError(null);
        setIsAudioOnlyFallback(false);
      } catch (error) {
        console.error('📞 Failed to initialize media stream:', error);
        
        // Try audio-only fallback like 2-person call
        if (callType === 'video') {
          try {
            localStream = await groupWebRTC.initializeLocalStream(false);
            setIsAudioOnlyFallback(true);
            setCameraError('Camera not available, using audio only');
          } catch (audioError) {
            console.error('📞 Audio-only fallback also failed:', audioError);
            setCameraError('Unable to access camera or microphone');
            throw audioError;
          }
        } else {
          setCameraError('Unable to access microphone');
          throw error;
        }
      }
      
      // API call to start group call
      const request: StartGroupCallRequest = { 
        call_type: callType,
        max_participants: 10 // Default to 10 participants
      };
      const response = await callApi<GroupCall>(
        API_ROUTES.CHAT_SERVER.START_GROUP_CALL(groupId),
        HTTP_METHOD_ENUM.POST,
        request
      );

      if (response) {
        setCurrentCall(response);
        
        // Set call state but keep connecting for a brief moment to show waiting screen
        setCallState(prev => ({
          ...prev,
          isActive: true,
          callId: response.id,
          groupId: response.group_id,
          groupName: response.group_name,
          isOutgoingCall: false,
          isConnecting: true, // Keep true initially to show waiting screen
          localStream
        }));

        // Set connecting to false after a brief delay to show waiting screen
        setTimeout(() => {
          setCallState(prev => ({
            ...prev,
            isConnecting: false
          }));
        }, 1500); // Show waiting screen for 1.5 seconds

        // SignalR call to notify participants
        try {
          await signalR.connection?.invoke("StartGroupCall", groupId.toString(), callType);
        } catch (signalRError) {
          console.error(`📞 [${instanceId.current}] StartGroupCall SignalR failed:`, signalRError);
          
          // Fallback: Try alternative method names
          try {
            await signalR.connection?.invoke("NotifyGroupCallStarted", groupId.toString(), callType);
          } catch (fallbackError) {
            console.error(`📞 [${instanceId.current}] All SignalR methods failed:`, fallbackError);
          }
        }
        
        // Manual notification as fallback if SignalR fails
        if (!signalR.connection || signalR.connection.state !== 'Connected') {
          // Could call an API endpoint to manually notify other users
          // await callApi('/api/groupcalls/' + response.id + '/notify', 'POST');
        }
        
        onCallStateChange?.(true);
      }
    } catch (error) {
      console.error('❌ Failed to start group call:', error);
      onError?.(`Failed to start group call: ${error}`);
      
      setCallState(prev => ({
        ...prev,
        isOutgoingCall: false,
        isConnecting: false
      }));
      
      groupWebRTC.cleanup();
    }
  }, [groupWebRTC, signalR.connection, onCallStateChange, onError]);

  // Join group call
  const joinGroupCall = useCallback(async (callId: string) => {
    try {
      // Check if already in this call to avoid "User already in call" error
      if (callState.isActive && callState.callId === callId) {
        return;
      }
      
      // Check if already connecting to avoid duplicate joins
      if (callState.isConnecting) {
        return;
      }

      // Check current call data
      if (currentCall) {
        // Check if current user is already in participants
        const isAlreadyParticipant = currentCall.participants?.some((p: any) => p.user_id === currentUser.id);
        if (isAlreadyParticipant) {
          return;
        }
      }
      
      setCallState(prev => ({ 
        ...prev, 
        isConnecting: true 
      }));

      // Initialize local media stream  
      const localStream = await groupWebRTC.initializeLocalStream(callState.callType === 'video');

      // API call to join group call
      const request: JoinGroupCallRequest = {
        is_audio_enabled: callState.isLocalAudioEnabled,
        is_video_enabled: callState.isLocalVideoEnabled,
        offer_data: undefined
      };
      
      try {
        const joinResponse = await callApi(
          API_ROUTES.CHAT_SERVER.JOIN_GROUP_CALL(callId),
          HTTP_METHOD_ENUM.POST,
          request
        );
      } catch (apiError) {
        console.error(`📞 [${instanceId.current}] ❌ API ERROR:`, apiError);
        throw apiError; // Re-throw to be caught by outer catch
      }

      // SignalR call to join
      await signalR.connection?.invoke("JoinGroupCall", callId);

      // Set current call from incoming data
      if (incomingCallData?.call) {
        setCurrentCall(incomingCallData.call);
      }

      setCallState(prev => ({
        ...prev,
        isActive: true,
        callId,
        isIncomingCall: false,
        isConnecting: false,
        localStream
      }));

      onCallStateChange?.(true);
    } catch (error) {
      console.error('❌ Failed to join group call:', error);
      onError?.(`Failed to join group call: ${error}`);
      
      setCallState(prev => ({
        ...prev,
        isConnecting: false
      }));
      
      groupWebRTC.cleanup();
    }
  }, [groupWebRTC, signalR.connection, callState.callType, onCallStateChange, onError]);

  // Leave group call
  const leaveGroupCall = useCallback(async () => {
    try {
      const { callId } = callState;
      if (!callId) return;


      // API call to leave
      await callApi(
        API_ROUTES.CHAT_SERVER.LEAVE_GROUP_CALL(callId),
        HTTP_METHOD_ENUM.DELETE
      );

      // SignalR call
      await signalR.connection?.invoke("LeaveGroupCall", callId);

      // Cleanup
      groupWebRTC.cleanup();
      
      setCallState({
        isActive: false,
        callType: 'video',
        isIncomingCall: false,
        isOutgoingCall: false,
        isConnecting: false,
        participants: new Map(),
        remoteStreams: new Map(),
        isLocalAudioEnabled: true,
        isLocalVideoEnabled: true,
        connectionQuality: 'good'
      });
      
      setCurrentCall(null);
      onCallStateChange?.(false);
    } catch (error) {
      console.error('❌ Failed to leave group call:', error);
      onError?.(`Failed to leave group call: ${error}`);
    }
  }, [callState.callId, signalR.connection, groupWebRTC, onCallStateChange, onError]);

  // End group call (only for initiator/admin)
  const endGroupCall = useCallback(async () => {
    try {
      const { callId } = callState;
      if (!callId) return;


      // API call to end call
      await callApi(
        API_ROUTES.CHAT_SERVER.END_GROUP_CALL(callId),
        HTTP_METHOD_ENUM.DELETE
      );

      // SignalR call
      await signalR.connection?.invoke("EndGroupCall", callId);

      // Clean up local state immediately
      groupWebRTC.cleanup();
      
      setCallState({
        isActive: false,
        callType: 'video',
        isIncomingCall: false,
        isOutgoingCall: false,
        isConnecting: false,
        participants: new Map(),
        remoteStreams: new Map(),
        isLocalAudioEnabled: true,
        isLocalVideoEnabled: true,
        connectionQuality: 'good'
      });
      
      setCurrentCall(null);
      onCallStateChange?.(false);

    } catch (error) {
      console.error('❌ Failed to end group call:', error);
      onError?.(`Failed to end group call: ${error}`);
    }
  }, [callState.callId, signalR.connection, groupWebRTC, onError, onCallStateChange]);

  // Toggle media
  const toggleMedia = useCallback(async (mediaType: 'audio' | 'video') => {
    try {
      const { callId } = callState;
      if (!callId) return;

      let newEnabled: boolean;
      
      if (mediaType === 'audio') {
        newEnabled = groupWebRTC.toggleLocalAudio() ?? false;
        setCallState(prev => ({ ...prev, isLocalAudioEnabled: newEnabled }));
      } else {
        newEnabled = groupWebRTC.toggleLocalVideo() ?? false;
        setCallState(prev => ({ ...prev, isLocalVideoEnabled: newEnabled }));
      }

      // API call to update media state
      const request: ToggleMediaRequest = { media_type: mediaType, enabled: newEnabled };
      await callApi(
        API_ROUTES.CHAT_SERVER.TOGGLE_GROUP_CALL_MEDIA(callId),
        HTTP_METHOD_ENUM.PUT,
        request
      );

      // SignalR notification
      await signalR.connection?.invoke("ToggleGroupCallMedia", callId, mediaType, newEnabled);

    } catch (error) {
      console.error(`❌ Failed to toggle ${mediaType}:`, error);
      onError?.(`Failed to toggle ${mediaType}: ${error}`);
    }
  }, [callState.callId, groupWebRTC, signalR.connection, onError]);

  // Accept incoming call
  const acceptIncomingCall = useCallback(async () => {
    if (!incomingCallData) return;
    
    
    // Use call.id from the nested call object, not callId directly
    const callId = incomingCallData.call?.id || incomingCallData.callId;
    
    if (callId) {
      // Check if already in this call (maybe already joined via other mechanism)
      if (callState.isActive && callState.callId === callId) {
        setIncomingCallData(null);
        setCallState(prev => ({ ...prev, isIncomingCall: false }));
        return;
      }
      
      // Set call as connecting first
      setCallState(prev => ({ ...prev, isConnecting: true, isIncomingCall: false }));
      
      try {
        // Set current call data before joining
        setCurrentCall(incomingCallData.call);
        
        await joinGroupCall(callId);
        
        // Clear incoming call data only after successful join
        setIncomingCallData(null);
      } catch (error) {
        console.error('📞 Failed to join call:', error);
        // Reset state on error
        setCallState(prev => ({ ...prev, isConnecting: false, isIncomingCall: true }));
      }
    } else {
      console.error('📞 No valid callId found in incoming call data');
      setCallState(prev => ({ ...prev, isConnecting: false }));
    }
  }, [incomingCallData, joinGroupCall, callState.isActive, callState.callId]);

  // Decline incoming call
  const declineIncomingCall = useCallback(() => {
    setIncomingCallData(null);
    setCallState(prev => ({ ...prev, isIncomingCall: false }));
  }, []);

  // SignalR Event Handlers - Optimized dependencies
  useEffect(() => {
    if (!signalR.connection) return;
    
    // Always set up handlers when connection or user changes

    // Group call started
    signalR.onGroupCallStarted?.((callEvent) => {
      // Check if this is an incoming call (not initiated by current user)
      if (callEvent?.call?.initiator_id !== currentUser.id) {
        setIncomingCallData(callEvent);
        setCallState(prev => ({ 
          ...prev, 
          isIncomingCall: true,
          callType: callEvent?.call?.call_type || 'video' 
        }));
      } else {
      }
    });

    // Group call ended
    signalR.onGroupCallEnded?.((endEvent) => {
      
      setCallState(prev => {
        if (endEvent.call_id === prev.callId) {
          groupWebRTC.cleanup();
          onCallStateChange?.(false);
          setCurrentCall(null);
          return {
            isActive: false,
            callType: 'video',
            isIncomingCall: false,
            isOutgoingCall: false,
            isConnecting: false,
            participants: new Map(),
            remoteStreams: new Map(),
            isLocalAudioEnabled: true,
            isLocalVideoEnabled: true,
            connectionQuality: 'good'
          };
        }
        return prev;
      });
    });

    // Participant joined
    signalR.onGroupCallParticipantJoined?.((joinEvent) => {
      
      setCallState(prev => {
        if (joinEvent.call_id === prev.callId) {
          return {
            ...prev,
            participants: new Map(prev.participants).set(joinEvent.participant.user_id, joinEvent.participant)
          };
        }
        return prev;
      });
    });

    // Participant left
    signalR.onGroupCallParticipantLeft?.((leaveEvent) => {
      
      setCallState(prev => {
        if (leaveEvent.call_id === prev.callId) {
          groupWebRTC.removeParticipant(leaveEvent.user_id);
          const newParticipants = new Map(prev.participants);
          newParticipants.delete(leaveEvent.user_id);
          return { ...prev, participants: newParticipants };
        }
        return prev;
      });
    });

    // Media toggled
    signalR.onGroupCallMediaToggled?.((mediaEvent) => {
      
      setCallState(prev => {
        if (mediaEvent.call_id === prev.callId) {
          const newParticipants = new Map(prev.participants);
          const participant = newParticipants.get(mediaEvent.user_id);
          if (participant) {
            const updatedParticipant = {
              ...participant,
              is_audio_enabled: mediaEvent.media_type === 'audio' ? mediaEvent.enabled : participant.is_audio_enabled,
              is_video_enabled: mediaEvent.media_type === 'video' ? mediaEvent.enabled : participant.is_video_enabled,
            };
            newParticipants.set(mediaEvent.user_id, updatedParticipant);
          }
          return { ...prev, participants: newParticipants };
        }
        return prev;
      });
    });

    // WebRTC Signaling Events
    signalR.onReceiveGroupCallOffer?.((data) => {
      
      if (data.target_user_id === currentUser.id) {
        setCallState(prev => {
          if (data.call_id === prev.callId) {
            groupWebRTC.handleOffer(data.from_user_id, JSON.parse(data.offer_data))
              .then(answer => {
                // Send answer back
                return signalR.connection?.invoke(
                  "SendGroupCallAnswer", 
                  data.call_id, 
                  data.from_user_id, 
                  JSON.stringify(answer)
                );
              })
              .catch(console.error);
          }
          return prev;
        });
      }
    });

    signalR.onReceiveGroupCallAnswer?.((data) => {
      
      if (data.target_user_id === currentUser.id) {
        setCallState(prev => {
          if (data.call_id === prev.callId) {
            groupWebRTC.handleAnswer(data.from_user_id, JSON.parse(data.answer_data))
              .catch(console.error);
          }
          return prev;
        });
      }
    });

    signalR.onReceiveGroupIceCandidate?.((data) => {
      
      if (data.target_user_id === currentUser.id) {
        setCallState(prev => {
          if (data.call_id === prev.callId) {
            groupWebRTC.handleIceCandidate(data.from_user_id, JSON.parse(data.candidate_data))
              .catch(console.error);
          }
          return prev;
        });
      }
    });

    return () => {
      // Cleanup handlers
      signalR.onGroupCallStarted?.(undefined);
      signalR.onGroupCallEnded?.(undefined);
      signalR.onGroupCallParticipantJoined?.(undefined);
      signalR.onGroupCallParticipantLeft?.(undefined);
      signalR.onGroupCallMediaToggled?.(undefined);
      signalR.onReceiveGroupCallOffer?.(undefined);
      signalR.onReceiveGroupCallAnswer?.(undefined);
      signalR.onReceiveGroupIceCandidate?.(undefined);
    };
  }, [signalR.connection, currentUser.id, groupWebRTC, onCallStateChange]);

  // Handle WebRTC ICE candidates
  useEffect(() => {
    const handleIceCandidate = (event: any) => {
      const { participantId, candidate } = event.detail;
      
      if (callState.callId && signalR.connection) {
        signalR.connection.invoke(
          "SendGroupIceCandidate",
          callState.callId,
          participantId.toString(),
          JSON.stringify(candidate)
        ).catch(console.error);
      }
    };

    window.addEventListener('groupCallIceCandidate', handleIceCandidate);
    return () => window.removeEventListener('groupCallIceCandidate', handleIceCandidate);
  }, [callState.callId, signalR.connection]);

  // Cleanup on beforeunload (page refresh/close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (callState.isActive && callState.callId) {
        // Use navigator.sendBeacon for reliable cleanup on page unload
        const url = API_ROUTES.CHAT_SERVER.LEAVE_GROUP_CALL(callState.callId);
        navigator.sendBeacon(url, JSON.stringify({}));
        
        // Also try regular API call as fallback
        leaveGroupCall().catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [callState.isActive, callState.callId, leaveGroupCall]);

  // Sync participants from currentCall to callState
  useEffect(() => {
    if (currentCall && currentCall.participants) {
      const participantsMap = new Map();
      currentCall.participants.forEach(participant => {
        participantsMap.set(participant.user_id, participant);
      });
      
      setCallState(prev => ({
        ...prev,
        participants: participantsMap
      }));
    }
  }, [currentCall]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (callState.isActive) {
        leaveGroupCall().catch(console.error);
      }
    };
  }, []);

  return {
    // State
    callState,
    currentCall,
    incomingCallData,
    
    // Local stream and controls - Use from callState if available, fallback to groupWebRTC
    localStream: callState.localStream || groupWebRTC.localStream,
    remoteStreams: callState.remoteStreams,
    connectionStates: groupWebRTC.connectionStates,
    
    // Error handling states like 2-person call
    cameraError,
    isAudioOnlyFallback,
    
    // Actions
    startGroupCall,
    joinGroupCall,
    leaveGroupCall,
    endGroupCall,
    acceptIncomingCall,
    declineIncomingCall,
    
    // Media controls
    toggleAudio: () => toggleMedia('audio'),
    toggleVideo: () => toggleMedia('video'),
  };
};