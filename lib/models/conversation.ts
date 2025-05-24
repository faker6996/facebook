// models/conversation.ts

export interface Conversation {
  id?: number;
  is_group?: boolean;
  name?: string;
  created_by?: string;
  created_at?: string;
}

export class ConversationModel {
  static table = "conversations";
  static columns = {
    id: "id",
    is_group: "is_group",
    name: "name",
    created_by: "created_by",
    created_at: "created_at",
  };
}
