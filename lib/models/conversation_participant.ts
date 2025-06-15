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
    Object.assign(this, data);
    this.id = data.id;
    this.conversation_id = data.conversation_id;
    this.user_id = data.user_id;
    this.joined_at = data.joined_at;
    this.last_seen_at = data.last_seen_at;
  }
}
