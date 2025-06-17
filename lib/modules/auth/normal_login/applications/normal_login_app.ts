import { User, UserInfoSso } from "@/lib/models/user";

import { hashPassword } from "@/lib/utils/hash";
import { baseRepo } from "@/lib/modules/common/base_repo";

export const normalLoginApp = {
  async handleAfterLogin(userInfo: User): Promise<User> {
    // check exits user
    const user = await baseRepo.getByField<User>(User, User.columns.email, userInfo.email);

    if (user) {
      user.is_sso = false; // Đánh dấu là user không phải SSO

      user.name = userInfo.name || user.name; // Cập nhật tên nếu có

      const updateUser = await baseRepo.update(user);
      updateUser!.password = "";
      return updateUser as User; // Trả về user đã cập nhật
    }

    const newUser = new User();
    newUser.email = userInfo.email;
    newUser.name = userInfo.name;
    newUser.is_sso = false;
    newUser.user_name = userInfo.email;

    newUser.password = await hashPassword(userInfo.email + "2025");

    // Nếu chưa tồn tại → tạo user mới
    // u.name = ;
    const rs = await baseRepo.insert(newUser);
    rs.password = ""; // Không trả về password
    return rs;
  },
};
