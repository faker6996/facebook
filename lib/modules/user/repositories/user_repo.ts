import { query } from '@/lib/db';

export const userRepository = {
  async create(data: { name: string }) {
    const res = await query(
      'INSERT INTO users (name) VALUES ($1) RETURNING *',
      [data.name]
    );
    return res.rows[0];
  }
};
