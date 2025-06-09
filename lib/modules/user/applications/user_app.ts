import { baseRepo } from "@/lib/modules/common/base_repo";
import { userRepo } from "../repositories/user_repo";
import { User } from "@/lib/models/user";

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
  // ✅ Hàm get: lấy tất cả hoặc theo id
  async getAllOrGetById(id?: number) {
    return await userRepo.getAllOrGetById(id);
  },
  async getUserGetByEmail(email: string) {
    return await baseRepo.getByField<User>("users", "email", email);
  },
};
