import { User, UserInfoSso } from "@/lib/models/user";
import { baseRepo } from "../../common/base_repo";
import { ssoGoogleRepo } from "../repositories/sso_google_app";
import { hashPassword } from "@/lib/utils/hash";

export const ssoGoogleApp = {
  async getAll() {
    return await ssoGoogleRepo.getAll();
  },
  async handleAfterSso(userInfo: UserInfoSso): Promise<User> {
    // check exits user
    const user = await baseRepo.getByField<User>(User.table, User.columns.email, userInfo.email);

    if (user) {
      return user;
    }

    const newUser = new User();
    newUser.email = userInfo.email;
    newUser.name = userInfo.name;
    newUser.is_sso = true;
    newUser.user_name = userInfo.email;
    newUser.password = newUser.password = await hashPassword(userInfo.email + "2025");

    // Nếu chưa tồn tại → tạo user mới
    // u.name = ;
    const rs = await baseRepo.insert(newUser);
    return rs;
  },
};
