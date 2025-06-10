import { baseRepo } from "@/lib/modules/common/base_repo";
import { userRepo } from "../repositories/user_repo";
import { User } from "@/lib/models/user";
import { comparePassword } from "@/lib/utils/hash";

export const userApp = {
  async execute(data: { name: string }) {
    if (!data.name || data.name.length < 2) {
      throw new Error("Tên không hợp lệ");
    }

    return await userRepo.create(data);
  },

  async getAll() {
    return await userRepo.getAll();
  },

  async getAllOrGetById(id?: number) {
    return await userRepo.getAllOrGetById(id);
  },

  async getUserGetByEmail(email: string) {
    return await baseRepo.getByField<User>("users", "email", email);
  },

  async verifyUser(email: string, password: string): Promise<User> {
    const user = await this.getUserGetByEmail(email);
    if (!user) {
      throw new Error("Sai tài khoản hoặc mật khẩu");
    }

    const isPasswordCorrect = await comparePassword(password, user.password ?? "");
    if (!isPasswordCorrect) {
      throw new Error("Sai tài khoản hoặc mật khẩu");
    }

    return user;
  },
};
