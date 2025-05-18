export interface PinnedMessage {
  id: number;
  conversation_id: number;
  message_id: number;
  pinned_by: number;
  pinned_at?: string;
}
