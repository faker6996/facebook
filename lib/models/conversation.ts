export class Conversation {
  id?: number;
  is_group?: boolean;
  name?: string;
  avatar_url?: string;
  created_by?: string;
  created_at?: string;

  static table = "conversations";
  static columns = {
    id: "id",
    is_group: "is_group",
    name: "name",
    avatar_url: "avatar_url",
    created_by: "created_by",
    created_at: "created_at",
  } as const;

  constructor(data: Partial<Conversation> = {}) {
    Object.assign(this, data);
    this.id = data.id;
    this.is_group = data.is_group;
    this.name = data.name;
    this.avatar_url = data.avatar_url;
    this.created_by = data.created_by;
    this.created_at = data.created_at;
  }
}
