export class MessageReaction {
  id?: number;
  message_id?: number;
  user_id?: number;
  emoji?: string;
  reacted_at?: string;

  static table = "message_reactions";
  static columns = {
    id: "id",
    message_id: "message_id",
    user_id: "user_id",
    emoji: "emoji",
    reacted_at: "reacted_at",
  } as const;

  constructor(data: Partial<MessageReaction> = {}) {
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}
