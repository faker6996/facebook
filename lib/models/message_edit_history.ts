export interface MessageEditHistory {
  id?: number;
  message_id?: number;
  old_content?: string;
  edited_at?: string;
}

export class MessageEditHistoryModel {
  static table = "message_edit_histories";
  static columns = {
    id: "id",
    message_id: "message_id",
    old_content: "old_content",
    edited_at: "edited_at",
  };
}
