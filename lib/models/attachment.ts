export interface Attachment {
  id: number;
  message_id: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
}
