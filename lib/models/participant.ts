export interface Participant {
  id?: number;
  user_id?: string;
  conversation_id?: string;
  joined_at?: string;
  role?: "member" | "admin";
}
export class ParticipantModel {
  static table = "participants";
  static columns = {
    id: "id",
    user_id: "user_id",
    conversation_id: "conversation_id",
    joined_at: "joined_at",
    role: "role",
  };
}
