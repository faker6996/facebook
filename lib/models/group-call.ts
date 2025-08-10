export interface GroupCall {
  id: string;
  group_id: number;
  group_name: string;
  initiator_id: number;
  initiator_name: string;
  call_type: 'audio' | 'video';
  started_at: string;
  status: 'active' | 'ended';
  participants: CallParticipant[];
}

export interface CallParticipant {
  user_id: number;
  user_name: string;
  avatar_url?: string;
  joined_at: string;
  is_audio_enabled: boolean;
  is_video_enabled: boolean;
  connection_quality: 'excellent' | 'good' | 'poor' | 'disconnected';
  media_stream?: MediaStream;
}

// Request/Response DTOs
export interface StartGroupCallRequest {
  call_type: 'audio' | 'video';
  invite_user_ids?: number[];
  max_participants?: number;
}

export interface JoinGroupCallRequest {
  offer_data?: string;
  is_audio_enabled: boolean;
  is_video_enabled: boolean;
}

export interface ToggleMediaRequest {
  media_type: 'audio' | 'video';
  enabled: boolean;
}

export interface UpdateConnectionQualityRequest {
  quality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

// SignalR Event Types
export interface GroupCallStartedEvent {
  call: GroupCall;
}

export interface GroupCallEndedEvent {
  call_id: string;
  group_id: number;
  reason: string;
}

export interface GroupCallParticipantJoinedEvent {
  call_id: string;
  group_id: number;
  participant: CallParticipant;
}

export interface GroupCallParticipantLeftEvent {
  call_id: string;
  group_id: number;
  user_id: number;
  reason: string;
}

export interface GroupCallMediaToggledEvent {
  call_id: string;
  group_id: number;
  user_id: number;
  media_type: 'audio' | 'video';
  enabled: boolean;
}

// WebRTC Signaling Events
export interface ReceiveGroupCallOfferEvent {
  call_id: string;
  group_id: number;
  from_user_id: number;
  target_user_id: number;
  offer_data: string;
}

export interface ReceiveGroupCallAnswerEvent {
  call_id: string;
  group_id: number;
  from_user_id: number;
  target_user_id: number;
  answer_data: string;
}

export interface ReceiveGroupIceCandidateEvent {
  call_id: string;
  group_id: number;
  from_user_id: number;
  target_user_id: number;
  candidate_data: string;
}

// Frontend State (keeping camelCase for internal state)
export interface GroupCallState {
  // Call info
  callId?: string;
  groupId?: number;
  groupName?: string;
  isActive: boolean;
  
  // Call type
  callType: 'audio' | 'video';
  
  // UI state
  isIncomingCall: boolean;
  isOutgoingCall: boolean;
  isConnecting: boolean;
  
  // Participants
  participants: Map<number, CallParticipant>;
  localParticipant?: CallParticipant;
  
  // Media streams
  localStream?: MediaStream;
  remoteStreams: Map<number, MediaStream>;
  
  // Media controls
  isLocalAudioEnabled: boolean;
  isLocalVideoEnabled: boolean;
  
  // Connection quality
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
}

export class GroupCallModel implements GroupCall {
  id: string;
  group_id: number;
  group_name: string;
  initiator_id: number;
  initiator_name: string;
  call_type: 'audio' | 'video';
  started_at: string;
  status: 'active' | 'ended';
  participants: CallParticipant[];

  constructor(data: Partial<GroupCall> = {}) {
    this.id = data.id || '';
    this.group_id = data.group_id || 0;
    this.group_name = data.group_name || '';
    this.initiator_id = data.initiator_id || 0;
    this.initiator_name = data.initiator_name || '';
    this.call_type = data.call_type || 'video';
    this.started_at = data.started_at || new Date().toISOString();
    this.status = data.status || 'active';
    this.participants = data.participants || [];
  }
}