export interface Participant {
  id: number;
  user_id: string;
  conversation_id: string;
  joined_at?: string;
  role?: 'member' | 'admin';
}
