// lib/db-utils/base-dao.ts
import { query } from "@/lib/db";

export class BaseDAO<T> {
  protected table: string;

  constructor(table: string) {
    this.table = table;
  }

  async insert(data: Partial<T>): Promise<T> {
    const columns: string[] = [];
    const values: any[] = [];
    const params: string[] = [];

    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        columns.push(key);
        values.push(value);
        params.push(`$${paramIndex++}`);
      }
    }

    const sql = `
      INSERT INTO ${this.table} (${columns.join(", ")})
      VALUES (${params.join(", ")})
      RETURNING *;
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  async getAll(): Promise<T[]> {
    const sql = `SELECT * FROM ${this.table} ORDER BY created_at DESC`;
    const result = await query(sql);
    return result.rows;
  }

  async getById(id: number): Promise<T | null> {
    const sql = `SELECT * FROM ${this.table} WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  async getAllOrGetById(id?: number): Promise<T | T[] | null> {
    if (id) {
      return this.getById(id); // kiểu T | null
    } else {
      return this.getAll(); // kiểu T[]
    }
  }
}
