import { MESSAGE_TYPE } from "@/lib/constants/enum";

export class Message {
  id?: number | string;
  conversation_id?: string;
  sender_id?: number;
  target_id?: number;
  content?: string;
  message_type?: "text" | "image" | "file";
  created_at?: string;
  status?: MessageStatus;

  static table = "messages";
  static columns = {
    id: "id",
    conversation_id: "conversation_id",
    sender_id: "sender_id",
    target_id: "target_id",
    content: "content",
    message_type: "message_type",
    created_at: "created_at",
    status: "status",
  } as const;

  constructor(data: Partial<Message> = {}) {
    Object.assign(this, data);
    this.id = data.id;
    this.conversation_id = data.conversation_id;
    this.sender_id = data.sender_id;
    this.target_id = data.target_id;
    this.content = data.content;
    this.message_type = data.message_type;
    this.created_at = data.created_at;
    this.status = data.status ?? "Sent";
  }
}

export type MessageStatus = "Sending" | "Sent" | "Delivered" | "Read" | "Failed";
export interface SendMessageRequest {
  sender_id: number;
  conversation_id: number;
  content: string;
  message_type: MESSAGE_TYPE;
  target_id?: number;
}
