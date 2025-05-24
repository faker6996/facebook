import { User, UserInfoSso } from "@/lib/models/user";
import { baseRepo } from "../../common/base_repo";
import { ssoFacebookRepo } from "../repositories/sso_facebook_repo";

export const ssoFacebookApp = {
  async getAll() {
    return await ssoFacebookRepo.getAll();
  },
  async handleAfterSso(userInfo: UserInfoSso): Promise<User> {
    debugger;
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
    newUser.password = userInfo.email + '2025';

    // Nếu chưa tồn tại → tạo user mới
    // u.name = ;
    const rs = await baseRepo.insert(newUser);
    return rs;
  },
};
