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
    Object.assign(this, data);
    this.id = data.id;
    this.message_id = data.message_id;
    this.file_name = data.file_name;
    this.file_url = data.file_url;
    this.file_type = data.file_type;
    this.file_size = data.file_size;
    this.created_at = data.created_at;
  }
}
