import { User, UserInfoSso } from "@/lib/models/user";

import { ssoFacebookRepo } from "../repositories/sso_facebook_repo";
import { hashPassword } from "@/lib/utils/hash";
import { baseRepo } from "@/lib/modules/common/base_repo";

export const ssoFacebookApp = {
  async handleAfterSso(userInfo: UserInfoSso): Promise<User> {
    // check exits user
    const user = await baseRepo.getByField<User>(User, User.columns.email, userInfo.email);

    if (user) {
      user.is_sso = true; // Đánh dấu là user SSO
      user.avatar_url = userInfo.picture?.data.url || user.avatar_url;
      user.name = userInfo.name || user.name; // Cập nhật tên nếu có

      const updateUser = await baseRepo.update(user);
      updateUser!.password = ""; // Giữ nguyên password cũ
      return updateUser as User; // Trả về user đã cập nhật
    }

    const newUser = new User();
    newUser.email = userInfo.email;
    newUser.name = userInfo.name;
    newUser.is_sso = true;
    newUser.sub = userInfo.sub;
    newUser.is_active = true; // Mặc định là active
    newUser.user_name = userInfo.email;
    newUser.avatar_url = userInfo.picture.data.url || "";
    newUser.password = await hashPassword(userInfo.email + "2025");

    // Nếu chưa tồn tại → tạo user mới
    // u.name = ;
    const rs = await baseRepo.insert(newUser);
    rs.password = ""; // Không trả về password
    return rs;
  },
};
