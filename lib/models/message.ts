export interface Message {
  id?: number;
  conversation_id?: string;
  sender_id?: string;
  content?: string;
  message_type?: "text" | "image" | "file";
  created_at?: string;
}

export class MessageModel {
  static table = "messages";
  static columns = {
    id: "id",
    conversation_id: "conversation_id",
    sender_id: "sender_id",
    content: "content",
    message_type: "message_type",
    created_at: "created_at",
  };
}
