export interface Message {
  id: number;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type?: 'text' | 'image' | 'file';
  created_at?: string;
}
