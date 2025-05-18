export interface MessageDeleted {
  id: number;
  message_id: number;
  user_id: number;
  deleted_at?: string;
}
