import { query } from '@/lib/db';

export const userRepo = {
  async create(data: { name: string }) {
    const res = await query(
      'INSERT INTO users (name) VALUES ($1) RETURNING *',
      [data.name]
    );
    return res.rows[0];
  },

  // ✅ Hàm get: lấy toàn bộ người dùng hoặc theo id
  async getAllOrGetById(id?: number) {
    if (id) {
      const res = await query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0]; // trả về 1 người dùng
    } else {
      const res = await query('SELECT * FROM users');
      return res.rows; // trả về danh sách người dùng
    }
  }
};
