export class Conversation {
  id?: number;
  is_group?: boolean;
  name?: string;
  created_by?: string;
  created_at?: string;

  static table = "conversations";
  static columns = {
    id: "id",
    is_group: "is_group",
    name: "name",
    created_by: "created_by",
    created_at: "created_at",
  };

  constructor(data: Partial<Conversation> = {}) {
    this.id = data.id;
    this.is_group = data.is_group;
    this.name = data.name;
    this.created_by = data.created_by;
    this.created_at = data.created_at;
  }
}
