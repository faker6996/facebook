import { User, UserInfoSso } from "@/lib/models/user";

import { hashPassword } from "@/lib/utils/hash";
import { baseRepo } from "@/lib/modules/common/base_repo";

export const normalLoginApp = {
  async handleAfterLogin(userInfo: User): Promise<User | null> {
    // check exits user
    const user = await baseRepo.getByField<User>(User, User.columns.email, userInfo.email);

    if (user) {
      user.is_sso = false; // Đánh dấu là user không phải SSO

      user.name = userInfo.name || user.name; // Cập nhật tên nếu có

      const updateUser = await baseRepo.update(user);
      updateUser!.password = "";
      return updateUser as User; // Trả về user đã cập nhật
    }
    return null;
  },
};
