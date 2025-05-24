// lib/dao/user-dao.ts
import { CreateUserDTO } from "@/lib/models/DTO/user";
import { User } from "@/lib/models/user";
import { query } from "@/lib/db";
import { BaseDAO } from "./base";
import { GoogleUserInfo } from "@/lib/models/google_user_info";

export class UserRepo extends BaseDAO<User> {
  constructor() {
    super("users");
  }

  async create(data: CreateUserDTO): Promise<User> {
    return this.insert(data);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const sql = `SELECT * FROM users WHERE email = $1`;
    const result = await query(sql, [email]);
    return result.rows[0] || null;
  }
  mapGoogleUserToUser(googleUser: GoogleUserInfo): Omit<User, "id"> {
    return {
      name: `${googleUser.family_name}${googleUser.given_name}`,
      avatar_url: googleUser.picture,
      email: googleUser.email,
      phone_number: undefined,
      address: undefined,
      created_at: new Date().toISOString(), // hoặc để null tùy bạn
    };
  }
}
