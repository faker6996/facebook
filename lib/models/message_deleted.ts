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
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}
