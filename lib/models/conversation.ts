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
    // Chỉ assign nếu data không null/undefined
    if (data && typeof data === 'object') {
      Object.assign(this, data);
    }
  }
}
