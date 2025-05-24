import { query } from "@/lib/db";
import { User } from "@/lib/models/user";

export const userRepo = {
  async create(data: { name: string }) {
    const res = await query("INSERT INTO users (name) VALUES ($1) RETURNING *", [data.name]);
    return res.rows[0];
  },

  async getAll(): Promise<User[]> {
    debugger;
    const res = await query("SELECT * FROM users ORDER BY created_at DESC");
    return res.rows as User[];
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const sql = `SELECT * FROM users WHERE email = $1`;
    const result = await query(sql, [email]);
    return result.rows[0] || null;
  },

  // ✅ Hàm get: lấy toàn bộ người dùng hoặc theo id
  async getAllOrGetById(id?: number) {
    if (id) {
      const res = await query("SELECT * FROM users WHERE id = $1", [id]);
      return res.rows[0]; // trả về 1 người dùng
    } else {
      const res = await query("SELECT * FROM users");
      return res.rows; // trả về danh sách người dùng
    }
  },
};
