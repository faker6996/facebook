export class Message {
  id?: number;
  conversation_id?: string;
  sender_id?: number;
  content?: string;
  message_type?: "text" | "image" | "file";
  created_at?: string;

  static table = "messages";
  static columns = {
    id: "id",
    conversation_id: "conversation_id",
    sender_id: "sender_id",
    content: "content",
    message_type: "message_type",
    created_at: "created_at",
  };

  constructor(data: Partial<Message> = {}) {
    this.id = data.id;
    this.conversation_id = data.conversation_id;
    this.sender_id = data.sender_id;
    this.content = data.content;
    this.message_type = data.message_type;
    this.created_at = data.created_at;
  }
}
