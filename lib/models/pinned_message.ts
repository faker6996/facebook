export interface PinnedMessage {
  id?: number;
  conversation_id?: number;
  message_id?: number;
  pinned_by?: number;
  pinned_at?: string;
}

export class PinnedMessageModel {
  static table = "pinned_messages";
  static columns = {
    id: "id",
    conversation_id: "conversation_id",
    message_id: "message_id",
    pinned_by: "pinned_by",
    pinned_at: "pinned_at",
  };
}
