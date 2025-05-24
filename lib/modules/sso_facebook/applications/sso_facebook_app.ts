import { User, UserInfoSso, UserModel } from "@/lib/models/user";
import { baseRepo } from "../../common/base_repo";
import { ssoFacebookRepo } from "../repositories/sso_facebook_repo";

export const ssoFacebookApp = {
  async getAll() {
    return await ssoFacebookRepo.getAll();
  },
  async handleAfterSso(userInfo: UserInfoSso): Promise<User> {
    // check exits user
    const user = await baseRepo.getByField<User>(UserModel.table, UserModel.columns.email, userInfo.email);

    if (user) {
      return user;
    }

    const newUser: User = {};
    newUser.email = userInfo.email;
    newUser.name = userInfo.name;
    newUser.is_sso = true;

    // Nếu chưa tồn tại → tạo user mới
    // u.name = ;
    const rs = await baseRepo.insert(newUser);
    return rs;
  },
};
