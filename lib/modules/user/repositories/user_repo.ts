import { query } from '@/lib/db';
import { User } from '@/lib/models/user';

export const userRepo = {
  async create(data: { name: string }) {
    const res = await query(
      'INSERT INTO users (name) VALUES ($1) RETURNING *',
      [data.name]
    );
    return res.rows[0];
  },

  async getAll(): Promise<User[]> {
    debugger
    const res = await query('SELECT * FROM users ORDER BY created_at DESC');
    return res.rows as User[];
  }
};
