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
  };

  constructor(data: Partial<MessageEditHistory> = {}) {
    this.id = data.id;
    this.message_id = data.message_id;
    this.old_content = data.old_content;
    this.edited_at = data.edited_at;
  }
}
