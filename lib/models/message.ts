import { MESSAGE_TYPE } from "@/lib/constants/enum";
import { Attachment } from "./attachment";

export class Message {
  id?: number | string;
  conversation_id?: string;
  sender_id?: number;
  target_id?: number;
  content?: string;
  message_type?: MESSAGE_TYPE; // PRIVATE/PUBLIC/GROUP
  content_type?: "text" | "image" | "file"; // text/image/file
  created_at?: string;
  status?: MessageStatus;
  attachments?: Attachment[];

  static table = "messages";
  static columns = {
    id: "id",
    conversation_id: "conversation_id",
    sender_id: "sender_id",
    target_id: "target_id",
    content: "content",
    message_type: "message_type",
    content_type: "content_type",
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
    this.content_type = data.content_type;
    this.created_at = data.created_at;
    this.status = data.status ?? "Sent";
    this.attachments = data.attachments ?? [];
  }
}

export type MessageStatus = "Sending" | "Sent" | "Delivered" | "Read" | "Failed";
export interface SendMessageRequest {
  sender_id: number;
  conversation_id: number;
  content: string;
  message_type: MESSAGE_TYPE;
  content_type?: "text" | "image" | "file"; // Thêm content_type riêng
  target_id?: number;
  attachments?: {
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
  }[];
}
