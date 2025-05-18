import { userRepository } from "../repositories/user-repo";

export const createUserUseCase = {
  async execute(data: { name: string }) {
    if (!data.name || data.name.length < 2) {
      throw new Error('Tên không hợp lệ');
    }

    return await userRepository.create(data);
  }
};
