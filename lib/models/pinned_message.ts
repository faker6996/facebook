export class PinnedMessage {
  id?: number;
  conversation_id?: number;
  message_id?: number;
  pinned_by?: number;
  pinned_at?: string;

  static table = "pinned_messages";
  static columns = {
    id: "id",
    conversation_id: "conversation_id",
    message_id: "message_id",
    pinned_by: "pinned_by",
    pinned_at: "pinned_at"
  };

  constructor(data: Partial<PinnedMessage> = {}) {
    this.id = data.id;
    this.conversation_id = data.conversation_id;
    this.message_id = data.message_id;
    this.pinned_by = data.pinned_by;
    this.pinned_at = data.pinned_at;
  }
}
