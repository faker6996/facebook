export interface MessageReaction {
  id?: number;
  message_id?: number;
  user_id?: number;
  emoji?: string;
  reacted_at?: string;
}

export class MessageReactionModel {
  static table = "message_reactions";
  static columns = {
    id: "id",
    message_id: "message_id",
    user_id: "user_id",
    emoji: "emoji",
    reacted_at: "reacted_at",
  };
}
