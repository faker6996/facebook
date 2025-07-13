import { baseRepo } from "@/lib/modules/common/base_repo";
import { userRepo } from "../repositories/user_repo";
import { User } from "@/lib/models/user";
import { comparePassword } from "@/lib/utils/hash";
import { ApiError } from "@/lib/utils/error";

export const userApp = {
  async verifyUser(email: string, password: string): Promise<User> {
    const user = await baseRepo.getByField<User>(User, User.columns.email, email);
    if (!user) throw new ApiError("Sai tài khoản hoặc mật khẩu", 401);

    const ok = await comparePassword(password, user.password ?? "");
    if (!ok) throw new ApiError("Sai tài khoản hoặc mật khẩu", 401);

    return user;
  },

  async execute(data: Partial<User>): Promise<User> {
    if (!data.email || !data.password) {
      throw new ApiError("Email and password are required", 400);
    }
    
    // Check if user already exists
    const existingUser = await baseRepo.getByField<User>(User, User.columns.email, data.email);
    if (existingUser) {
      throw new ApiError("User with this email already exists", 409);
    }

    const newUser = await baseRepo.insert<User>(data);
    return newUser;
  },

  async getAll(): Promise<User[]> {
    return await baseRepo.getAll<User>(User, {
      orderBy: ["created_at"],
      orderDirections: { created_at: "DESC" },
      allowedOrderFields: ["id", "created_at", "name", "user_name"]
    });
  },

  async getById(id: number): Promise<User> {
    const user = await baseRepo.getById<User>(User, id);
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    return user;
  },

  async searchUsers(query: string): Promise<User[]> {
    if (!query || query.trim().length < 2) {
      throw new ApiError("Search query must be at least 2 characters", 400);
    }

    return await userRepo.searchByNameOrUsername(query.trim());
  },
};
