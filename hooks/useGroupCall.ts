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
  console.log('📞 useGroupCall instance:', instanceId.current);
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

  // Refs

  // Hooks
  const signalR = useSignalR();
  const groupWebRTC = useGroupWebRTC({
    localUserId: currentUser.id || 0,
    onConnectionStateChange: (participantId, state) => {
      console.log(`🔗 Participant ${participantId} connection state:`, state);
      
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
      console.log(`📺 Received remote stream from participant ${participantId}`);
      setCallState(prev => ({
        ...prev,
        remoteStreams: new Map(prev.remoteStreams).set(participantId, stream)
      }));
    },
    onRemoteStreamRemoved: (participantId) => {
      console.log(`🚪 Remote stream removed for participant ${participantId}`);
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
      console.log(`📞 Starting group ${callType} call for group ${groupId}`);
      
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
          console.log('📞 Found active call:', activeCall);
          console.log('📞 Debug: activeCall.initiator_id =', activeCall.initiator_id);
          console.log('📞 Debug: currentUser.id =', currentUser.id);
          
          // Fix: Backend returns initiator_id (snake_case), not initiatorId (camelCase)
          const initiatorId = activeCall.initiator_id;
          console.log('📞 Debug: resolved initiatorId =', initiatorId);
          
          // Check if current user is the initiator of the active call (type-safe comparison)
          const isInitiator = Number(initiatorId) === Number(currentUser.id);
          console.log('📞 Debug: isInitiator =', isInitiator);
          
          if (isInitiator) {
            console.log('📞 User is initiator of active call, reconnecting without join');
            
            // Initialize local media stream first
            const localStream = await groupWebRTC.initializeLocalStream(activeCall.call_type === 'video');
            
            // Set call state directly without calling join API
            setCallState(prev => ({
              ...prev,
              isActive: true,
              callId: activeCall.id,
              groupId: activeCall.group_id,
              groupName: activeCall.group_name,
              callType: activeCall.call_type,
              isOutgoingCall: false,
              isConnecting: false,
              localStream
            }));
            
            setCurrentCall(activeCall);
            onCallStateChange?.(true);
            return;
          } else {
            // User is not initiator, need to join the call
            console.log('📞 User is not initiator, joining active call');
            try {
              setCallState(prev => ({ ...prev, callType: activeCall.call_type }));
              await joinGroupCall(activeCall.id);
              return;
            } catch (joinError) {
              console.log('📞 Failed to join active call, starting new call instead:', joinError);
              // Continue to start new call as fallback
            }
          }
        }
      } catch (error) {
        // No active call found, continue with starting new call
        console.log('📞 No active call found, starting new call');
      }

      // Initialize local media stream
      const localStream = await groupWebRTC.initializeLocalStream(callType === 'video');
      
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
        console.log('📞 Group call started:', response);
        setCurrentCall(response);
        
        setCallState(prev => ({
          ...prev,
          isActive: true,
          callId: response.id,
          groupId: response.group_id,
          groupName: response.group_name,
          isOutgoingCall: false,
          isConnecting: false,
          localStream
        }));

        // SignalR call to notify participants
        console.log(`📞 [${instanceId.current}] Sending StartGroupCall SignalR event:`, {
          groupId: groupId.toString(), 
          callType,
          connectionState: signalR.connection?.state
        });
        
        try {
          await signalR.connection?.invoke("StartGroupCall", groupId.toString(), callType);
          console.log(`📞 [${instanceId.current}] StartGroupCall SignalR sent successfully`);
        } catch (signalRError) {
          console.error(`📞 [${instanceId.current}] StartGroupCall SignalR failed:`, signalRError);
          
          // Fallback: Try alternative method names
          try {
            await signalR.connection?.invoke("NotifyGroupCallStarted", groupId.toString(), callType);
            console.log(`📞 [${instanceId.current}] NotifyGroupCallStarted fallback sent`);
          } catch (fallbackError) {
            console.error(`📞 [${instanceId.current}] All SignalR methods failed:`, fallbackError);
          }
        }
        
        // Manual notification as fallback if SignalR fails
        if (!signalR.connection || signalR.connection.state !== 'Connected') {
          console.log(`📞 [${instanceId.current}] SignalR not connected, trying manual notification`);
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
      console.log(`📞 [${instanceId.current}] Joining group call ${callId}`);
      
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
      await callApi(
        API_ROUTES.CHAT_SERVER.JOIN_GROUP_CALL(callId),
        HTTP_METHOD_ENUM.POST,
        request
      );

      // SignalR call to join
      await signalR.connection?.invoke("JoinGroupCall", callId);

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

      console.log(`🚪 Leaving group call ${callId}`);

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

      console.log(`⏹️ Ending group call ${callId}`);

      // API call to end call
      await callApi(
        API_ROUTES.CHAT_SERVER.END_GROUP_CALL(callId),
        HTTP_METHOD_ENUM.DELETE
      );

      // SignalR call
      await signalR.connection?.invoke("EndGroupCall", callId);

    } catch (error) {
      console.error('❌ Failed to end group call:', error);
      onError?.(`Failed to end group call: ${error}`);
    }
  }, [callState.callId, signalR.connection, onError]);

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
    
    console.log('📞 Accepting incoming call with data:', incomingCallData);
    
    // Set call as connecting first
    setCallState(prev => ({ ...prev, isConnecting: true, isIncomingCall: false }));
    
    // Use call.id from the nested call object, not callId directly
    const callId = incomingCallData.call?.id || incomingCallData.callId;
    console.log('📞 Using callId for join:', callId);
    
    if (callId) {
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
  }, [incomingCallData, joinGroupCall]);

  // Decline incoming call
  const declineIncomingCall = useCallback(() => {
    console.log('📞 Declining incoming group call');
    setIncomingCallData(null);
    setCallState(prev => ({ ...prev, isIncomingCall: false }));
  }, []);

  // SignalR Event Handlers
  useEffect(() => {
    console.log(`📞 [${instanceId.current}] HOOK: Setting up SignalR event handlers:`, {
      hasConnection: !!signalR.connection,
      connectionState: signalR.connection?.state,
      currentUserId: currentUser.id
    });
    
    if (!signalR.connection) return;
    
    // Always set up handlers when connection or user changes
    console.log(`📞 [${instanceId.current}] HOOK: Registering SignalR event handlers...`);

    // Group call started
    signalR.onGroupCallStarted?.((callEvent) => {
      console.log(`📞 [${instanceId.current}] HOOK: Group call started event:`, {
        callEvent,
        callInitiatorId: callEvent?.call?.initiator_id,
        currentUserId: currentUser.id,
        isIncomingCall: callEvent?.call?.initiator_id !== currentUser.id,
        hasSignalRConnection: !!signalR.connection
      });
      
      // Check if this is an incoming call (not initiated by current user)
      if (callEvent?.call?.initiator_id !== currentUser.id) {
        console.log(`📞 [${instanceId.current}] HOOK: Setting incoming call data:`, callEvent);
        setIncomingCallData(callEvent);
        setCallState(prev => ({ ...prev, isIncomingCall: true }));
      } else {
        console.log(`📞 [${instanceId.current}] HOOK: Ignoring own call start event`);
      }
    });

    // Group call ended
    signalR.onGroupCallEnded?.((endEvent) => {
      console.log('📞 Group call ended event:', endEvent);
      
      if (endEvent.call_id === callState.callId) {
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
      }
    });

    // Participant joined
    signalR.onGroupCallParticipantJoined?.((joinEvent) => {
      console.log('👥 Participant joined:', joinEvent);
      
      if (joinEvent.call_id === callState.callId) {
        setCallState(prev => ({
          ...prev,
          participants: new Map(prev.participants).set(joinEvent.participant.user_id, joinEvent.participant)
        }));
      }
    });

    // Participant left
    signalR.onGroupCallParticipantLeft?.((leaveEvent) => {
      console.log('🚪 Participant left:', leaveEvent);
      
      if (leaveEvent.call_id === callState.callId) {
        groupWebRTC.removeParticipant(leaveEvent.user_id);
        setCallState(prev => {
          const newParticipants = new Map(prev.participants);
          newParticipants.delete(leaveEvent.user_id);
          return { ...prev, participants: newParticipants };
        });
      }
    });

    // Media toggled
    signalR.onGroupCallMediaToggled?.((mediaEvent) => {
      console.log('🎛️ Media toggled:', mediaEvent);
      
      if (mediaEvent.call_id === callState.callId) {
        setCallState(prev => {
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
        });
      }
    });

    // WebRTC Signaling Events
    signalR.onReceiveGroupCallOffer?.((data) => {
      console.log('📤 Received group call offer:', data);
      
      if (data.call_id === callState.callId && data.target_user_id === currentUser.id) {
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
    });

    signalR.onReceiveGroupCallAnswer?.((data) => {
      console.log('📥 Received group call answer:', data);
      
      if (data.call_id === callState.callId && data.target_user_id === currentUser.id) {
        groupWebRTC.handleAnswer(data.from_user_id, JSON.parse(data.answer_data))
          .catch(console.error);
      }
    });

    signalR.onReceiveGroupIceCandidate?.((data) => {
      console.log('🧊 Received ICE candidate:', data);
      
      if (data.call_id === callState.callId && data.target_user_id === currentUser.id) {
        groupWebRTC.handleIceCandidate(data.from_user_id, JSON.parse(data.candidate_data))
          .catch(console.error);
      }
    });

    return () => {
      // Cleanup handlers
      console.log(`📞 [${instanceId.current}] HOOK: Cleaning up SignalR event handlers...`);
      signalR.onGroupCallStarted?.(undefined);
      signalR.onGroupCallEnded?.(undefined);
      signalR.onGroupCallParticipantJoined?.(undefined);
      signalR.onGroupCallParticipantLeft?.(undefined);
      signalR.onGroupCallMediaToggled?.(undefined);
      signalR.onReceiveGroupCallOffer?.(undefined);
      signalR.onReceiveGroupCallAnswer?.(undefined);
      signalR.onReceiveGroupIceCandidate?.(undefined);
    };
  }, [signalR, currentUser.id, callState.callId, groupWebRTC, onCallStateChange]);

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
    
    // Local stream and controls
    localStream: groupWebRTC.localStream,
    remoteStreams: callState.remoteStreams,
    connectionStates: groupWebRTC.connectionStates,
    
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