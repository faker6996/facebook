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
    pinned_at: "pinned_at",
  } as const;

  constructor(data: Partial<PinnedMessage> = {}) {
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}
