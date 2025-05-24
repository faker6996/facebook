export class MessageStatus {
  id?: number;
  message_id?: string;
  user_id?: string;
  status?: "sent" | "delivered" | "seen";
  updated_at?: string;

  static table = "message_statuses";
  static columns = {
    id: "id",
    message_id: "message_id",
    user_id: "user_id",
    status: "status",
    updated_at: "updated_at",
  };

  constructor(data: Partial<MessageStatus> = {}) {
    this.id = data.id;
    this.message_id = data.message_id;
    this.user_id = data.user_id;
    this.status = data.status;
    this.updated_at = data.updated_at;
  }
}
