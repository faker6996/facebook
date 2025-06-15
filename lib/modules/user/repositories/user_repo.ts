import { query } from "@/lib/db";
import { User } from "@/lib/models/user";

export const userRepo = {
  // async getUserByEmail(email: string): Promise<User | null> {
  //   const sql = `SELECT * FROM users WHERE email = $1`;
  //   const result = await query(sql, [email]);
  //   return result.rows[0] || null;
  // },
  // // ✅ Hàm get: lấy toàn bộ người dùng hoặc theo id
  // async getAllOrGetById(id?: number) {
  //   if (id) {
  //     const res = await query("SELECT * FROM users WHERE id = $1", [id]);
  //     return res.rows[0]; // trả về 1 người dùng
  //   } else {
  //     const res = await query("SELECT * FROM users");
  //     return res.rows; // trả về danh sách người dùng
  //   }
  // },
};
