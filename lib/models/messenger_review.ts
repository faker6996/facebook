export class MessengerPreview {
  conversation_id?: number;
  other_user_id?: number;
  target_id?: number;
  other_user_name?: string;
  avatar_url?: string;
  last_message?: string | null;
  last_message_at?: string | null;
  last_seen_at?: string | null;
  other_is_online?: boolean;
  
  // Group-specific properties (for when is_group = true)
  is_group?: boolean;
  name?: string; // Group name
  member_count?: number;
  group_avatar_url?: string;
  last_message_sender?: string; // Sender name for group messages
  last_message_content?: string; // Alternative to last_message
  unread_count?: number;
}
