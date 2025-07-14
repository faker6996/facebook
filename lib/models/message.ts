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
  reply_to_message_id?: number;
  created_at?: string;
  status?: MessageStatus;
  attachments?: Attachment[];
  replied_message?: Message; // Thông tin tin nhắn được reply
  reactions?: MessageReaction[]; // Danh sách reactions

  static table = "messages";
  static columns = {
    id: "id",
    conversation_id: "conversation_id",
    sender_id: "sender_id",
    target_id: "target_id",
    content: "content",
    message_type: "message_type",
    content_type: "content_type",
    reply_to_message_id: "reply_to_message_id",
    created_at: "created_at",
    status: "status",
  } as const;

  constructor(data: Partial<Message> = {}) {
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
      // Set default values for important fields
      this.status = data.status ?? "Sent";
      this.attachments = data.attachments ?? [];
      this.reactions = data.reactions ?? [];
    }
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
  reply_to_message_id?: number; // Thêm reply support
  attachments?: {
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
  }[];
}

export interface MessageReaction {
  id?: number;
  message_id?: number;
  user_id?: number;
  emoji?: string;
  reacted_at?: string;
}

export interface AddReactionRequest {
  message_id: number;
  user_id: number;
  emoji: string;
}

export interface RemoveReactionRequest {
  message_id: number;
  user_id: number;
  emoji: string;
}
