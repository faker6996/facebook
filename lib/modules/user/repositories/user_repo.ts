import { safeQuery } from "@/lib/modules/common/safe_query";
import { User } from "@/lib/models/user";

export const userRepo = {
  async searchByNameOrUsername(query: string): Promise<User[]> {
    const searchPattern = `%${query}%`;
    
    const sql = `
      SELECT id, name, user_name, email, avatar_url, created_at, updated_at
      FROM ${User.table}
      WHERE LOWER(name) LIKE LOWER($1) 
         OR LOWER(user_name) LIKE LOWER($2)
      ORDER BY 
        CASE 
          WHEN LOWER(name) = LOWER($3) THEN 1
          WHEN LOWER(user_name) = LOWER($4) THEN 2
          WHEN LOWER(name) LIKE LOWER($5) THEN 3
          WHEN LOWER(user_name) LIKE LOWER($6) THEN 4
          ELSE 5
        END,
        name ASC
      LIMIT 20
    `;
    
    const params = [
      searchPattern, // $1 - name LIKE pattern
      searchPattern, // $2 - user_name LIKE pattern  
      query,         // $3 - exact name match
      query,         // $4 - exact user_name match
      `${query}%`,   // $5 - name starts with
      `${query}%`    // $6 - user_name starts with
    ];
    
    const result = await safeQuery(sql, params);
    return result.rows.map(row => new User(row));
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const sql = `SELECT * FROM ${User.table} WHERE email = $1`;
    const result = await safeQuery(sql, [email]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  },

  async getAllOrGetById(id?: number): Promise<User | User[] | null> {
    if (id) {
      const sql = `SELECT * FROM ${User.table} WHERE id = $1`;
      const result = await safeQuery(sql, [id]);
      return result.rows[0] ? new User(result.rows[0]) : null;
    } else {
      const sql = `SELECT * FROM ${User.table} ORDER BY created_at DESC`;
      const result = await safeQuery(sql);
      return result.rows.map(row => new User(row));
    }
  },
};
