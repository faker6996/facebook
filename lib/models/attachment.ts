export class Attachment {
  id?: number;
  message_id?: number;
  file_name?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  created_at?: string;

  static table = "attachments";
  static columns = {
    id: "id",
    message_id: "message_id",
    file_name: "file_name",
    file_url: "file_url",
    file_type: "file_type",
    file_size: "file_size",
    created_at: "created_at",
  } as const;

  constructor(data: Partial<Attachment> = {}) {
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}
