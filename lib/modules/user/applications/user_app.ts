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
};
