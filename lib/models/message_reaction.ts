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
  };

  constructor(data: Partial<MessageReaction> = {}) {
    this.id = data.id;
    this.message_id = data.message_id;
    this.user_id = data.user_id;
    this.emoji = data.emoji;
    this.reacted_at = data.reacted_at;
  }
}
