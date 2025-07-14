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
  } as const;

  constructor(data: Partial<MessageStatus> = {}) {
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}
