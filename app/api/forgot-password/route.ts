import { NextRequest } from "next/server";
import { sendMail } from "@/lib/utils/send-mail";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { ApiError } from "@/lib/utils/error";
import { baseRepo } from "@/lib/modules/common/base_repo";
import { User } from "@/lib/models/user";
import { ResetPasswordToken } from "@/lib/models/password_reset_token";
import { LOCALE } from "@/lib/constants/enum";

async function handler(req: NextRequest) {
  debugger;

  const { email, locale } = await req.json();
  const user = await baseRepo.getByField<User>(User, User.columns.email, email);
  if (!user) throw new ApiError("Không tìm thấy người dùng", 404);

  const token = crypto.randomUUID();

  const resetPasswordToken = new ResetPasswordToken();
  resetPasswordToken.user_id = user.id;
  resetPasswordToken.token = token;
  resetPasswordToken.expires_at = new Date(Date.now() + 30 * 60 * 1000);

  await baseRepo.deleteAll(ResetPasswordToken);
  await baseRepo.insert<ResetPasswordToken>(resetPasswordToken);

  // Lấy locale từ URL
  const resetLink = `${process.env.AUTH_URL}/${locale}/reset-password?token=${token}`;

  await sendMail({
    to: email,
    subject: "Đặt lại mật khẩu",
    html: `Click vào liên kết để đặt lại mật khẩu: <a href="${resetLink}">${resetLink}</a>`,
  });

  return createResponse(null, "Đã gửi email đặt lại mật khẩu");
}

export const POST = withApiHandler(handler);
