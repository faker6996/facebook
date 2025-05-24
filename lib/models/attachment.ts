export interface Attachment {
  id?: number;
  message_id?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
}

export class AttachmentModel {
  static table = "attachments";
  static columns = {
    id: "id",
    message_id: "message_id",
    file_url: "file_url",
    file_type: "file_type",
    file_size: "file_size",
  };
}
