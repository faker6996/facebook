export interface MessageReaction {
  id: number;
  message_id: number;
  user_id: number;
  emoji: string;
  reacted_at?: string;
}
