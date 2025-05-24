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
    role: "role"
  };

  constructor(data: Partial<Participant> = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.conversation_id = data.conversation_id;
    this.joined_at = data.joined_at;
    this.role = data.role;
  }
}
