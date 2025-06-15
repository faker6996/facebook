export class MessageDeleted {
  id?: number;
  message_id?: number;
  user_id?: number;
  deleted_at?: string;

  static table = "message_deleted";
  static columns = {
    id: "id",
    message_id: "message_id",
    user_id: "user_id",
    deleted_at: "deleted_at",
  } as const;

  constructor(data: Partial<MessageDeleted> = {}) {
    Object.assign(this, data);
    this.id = data.id;
    this.message_id = data.message_id;
    this.user_id = data.user_id;
    this.deleted_at = data.deleted_at;
  }
}
