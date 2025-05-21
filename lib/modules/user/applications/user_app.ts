import { userRepo } from "../repositories/user_repo";

export const userApp = {
  async execute(data: { name: string }) {
    if (!data.name || data.name.length < 2) {
      throw new Error('Tên không hợp lệ');
    }

    return await userRepo.create(data);
  },

  async getAll() {
    return await userRepo.getAll();
  }
};
