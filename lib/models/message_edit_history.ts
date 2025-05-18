export interface MessageEditHistory {
  id: number;
  message_id: number;
  old_content: string;
  edited_at?: string;
}
