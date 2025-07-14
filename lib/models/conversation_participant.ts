export class ConversationParticipant {
  id?: number;
  conversation_id?: number;
  user_id?: number;
  joined_at?: string;
  last_seen_at?: string;

  static table = "conversation_participants";

  static columns = {
    id: "id",
    conversation_id: "conversation_id",
    user_id: "user_id",
    joined_at: "joined_at",
    last_seen_at: "last_seen_at",
  } as const;

  constructor(data: Partial<ConversationParticipant> = {}) {
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}
