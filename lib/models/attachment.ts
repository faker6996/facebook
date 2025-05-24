export class Attachment {
  id?: number;
  message_id?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;

  static table = "attachments";
  static columns = {
    id: "id",
    message_id: "message_id",
    file_url: "file_url",
    file_type: "file_type",
    file_size: "file_size",
  };

  constructor(data: Partial<Attachment> = {}) {
    this.id = data.id;
    this.message_id = data.message_id;
    this.file_url = data.file_url;
    this.file_type = data.file_type;
    this.file_size = data.file_size;
  }
}
