export class Participant {
  id?: number;
  user_id?: string;
  conversation_id?: string;
  joined_at?: string;
  role?: "member" | "admin";

  static table = "participants";
  static columns = {
    id: "id",
    user_id: "user_id",
    conversation_id: "conversation_id",
    joined_at: "joined_at",
    role: "role",
  } as const;

  constructor(data: Partial<Participant> = {}) {
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}
