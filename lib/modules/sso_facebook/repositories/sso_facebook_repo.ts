import { User } from "@/lib/models/user";
import { baseRepo } from "../../common/base_repo";

export const ssoFacebookRepo = {
  async getAll(): Promise<User[]> {
    return baseRepo.getAll<User>(User.table);
  },
};
