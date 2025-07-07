import { NextRequest } from "next/server";
import { hashPassword } from "@/lib/utils/hash"; // Bạn cần hàm hash này
import { baseRepo } from "@/lib/modules/common/base_repo";
import { ApiError } from "@/lib/utils/error";
import { createResponse } from "@/lib/utils/response";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { ResetPasswordToken } from "@/lib/models/password_reset_token";
import { User } from "@/lib/models/user";

async function handler(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password) {
    throw new ApiError("Thiếu token hoặc mật khẩu", 400);
  }
  // 1. Tìm token
  const resetToken = await baseRepo.getByField<ResetPasswordToken>(ResetPasswordToken, ResetPasswordToken.columns.token, token);

  if (!resetToken) throw new ApiError("Token không hợp lệ hoặc đã hết hạn", 400);

  const expiresAtMs = new Date(resetToken.expires_at!).getTime(); // number
  const nowMs = Date.now(); // number

  if (expiresAtMs <= nowMs) {
    throw new ApiError("Token đã hết hạn", 400);
  }

  // 2. Cập nhật mật khẩu mới
  const hashedPassword = await hashPassword(password);
  const user = new User();

  user.id = resetToken.user_id;
  user.password = hashedPassword;
  await baseRepo.update(user);

  // 3. Xoá token sau khi dùng
  await baseRepo.deleteById(ResetPasswordToken, resetToken.id!);

  return createResponse(null, "Đổi mật khẩu thành công");
}

export const POST = withApiHandler(handler);
