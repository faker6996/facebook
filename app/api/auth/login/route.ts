// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { serialize } from "cookie";

import { userApp } from "@/lib/modules/user/applications/user_app";
import { signJwt } from "@/lib/utils/jwt";
import { createResponse } from "@/lib/utils/response";

import { withApiHandler } from "@/lib/utils/withApiHandler";
import { ApiError } from "@/lib/utils/error";

async function handler(req: NextRequest) {
  const { email, password } = await req.json();

  const user = await userApp.verifyUser(email, password);
  if (!user) throw new ApiError("Sai tài khoản hoặc mật khẩu", 401);

  const token = signJwt({ sub: user.id!.toString(), email: user.email, name: user.name, id: user.id! }, "2h");

  /* ✅ KHÔNG đưa token vào JSON */
  const res = createResponse(null, "Đăng nhập thành công");

  res.headers.set(
    "Set-Cookie",
    serialize("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60,
    })
  );

  return res; // { success:true, data:null }
}

export const POST = withApiHandler(handler);
