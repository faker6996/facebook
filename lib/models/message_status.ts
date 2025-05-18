export interface MessageStatus {
  id: number;
  message_id: string;
  user_id: string;
  status?: 'sent' | 'delivered' | 'seen';
  updated_at?: string;
}
