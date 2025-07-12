import { User } from "./user";

export interface Group {
  id: number;
  name: string;
  description?: string;
  avatar_url?: string;
  member_count: number;
  max_members: number;
  is_public: boolean;
  require_approval: boolean;
  invite_link?: string;
  created_at: string;
  created_by: User;
  is_group: true;
}

export interface GroupMember {
  user_id: number;
  name: string;
  avatar_url?: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  last_seen_at?: string;
  is_online: boolean;
}

export interface GroupJoinRequest {
  id: number;
  user: User;
  message?: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  avatar_url?: string;
  initial_members: number[];
  is_public?: boolean;
  require_approval?: boolean;
  max_members?: number;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  avatar_url?: string;
  is_public?: boolean;
  require_approval?: boolean;
  max_members?: number;
}

export interface AddMembersRequest {
  user_ids: number[];
}

export interface PromoteMemberRequest {
  user_id: number;
  role: 'admin' | 'moderator' | 'member';
}

export interface JoinRequestRequest {
  message?: string;
}

export interface HandleRequestRequest {
  action: 'approve' | 'reject';
  reason?: string;
}

// Extend existing MessengerPreview for groups
export interface GroupPreview {
  conversation_id: number;
  is_group: true;
  name: string;
  member_count: number;
  group_avatar_url?: string;
  last_message_content?: string;
  last_message_at?: string;
  last_message_sender?: string; // Show sender name for group messages
  unread_count: number;
  other_user_id?: never; // Groups don't have other_user_id
  other_user_name?: never;
  other_is_online?: never;
  avatar_url?: never;
}

// Group event types for SignalR
export interface GroupEvent {
  type: 'member_added' | 'member_removed' | 'member_promoted' | 'group_updated' | 'join_request';
  groupId: number;
  data: any;
}

// Group permissions
export type GroupPermission = 
  | 'add_members' 
  | 'remove_members' 
  | 'edit_info' 
  | 'delete_messages' 
  | 'pin_messages'
  | 'manage_requests'
  | 'promote_members'
  | 'manage_invites';

export interface GroupPermissionCheck {
  groupId: number;
  userId: number;
  permission: GroupPermission;
}