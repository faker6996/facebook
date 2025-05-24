export interface MessageDeleted {
  id?: number;
  message_id?: number;
  user_id?: number;
  deleted_at?: string;
}

export class MessageDeletedModel {
  static table = "message_deleted";
  static columns = {
    id: "id",
    message_id: "message_id",
    user_id: "user_id",
    deleted_at: "deleted_at",
  };
}
