import { User, UserModel } from "@/lib/models/user";
import { baseRepo } from "../../common/base_repo";

export const ssoGoogleRepo = {
  async getAll(): Promise<User[]> {
    return baseRepo.getAll<User>(UserModel.table);
  },
};
