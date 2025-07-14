export class MessageEditHistory {
  id?: number;
  message_id?: number;
  old_content?: string;
  edited_at?: string;

  static table = "message_edit_histories";
  static columns = {
    id: "id",
    message_id: "message_id",
    old_content: "old_content",
    edited_at: "edited_at",
  } as const;

  constructor(data: Partial<MessageEditHistory> = {}) {
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}
