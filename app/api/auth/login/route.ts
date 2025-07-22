// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { serialize } from "cookie";

import { userApp } from "@/lib/modules/user/applications/user_app";
import { signJwt } from "@/lib/utils/jwt";
import { createResponse } from "@/lib/utils/response";

import { withApiHandler } from "@/lib/utils/withApiHandler";
import { ApiError } from "@/lib/utils/error";
import { saveToLocalStorage } from "@/lib/utils/local-storage";
import { normalLoginApp } from "@/lib/modules/auth/normal_login/applications/normal_login_app";
import { cacheUser } from "@/lib/cache/user";

async function handler(req: NextRequest) {
  const { email, password, rememberMe } = await req.json();

  const userVerify = await userApp.verifyUser(email, password);
  const user = await normalLoginApp.handleAfterLogin(userVerify);

  if (!user) throw new ApiError("Sai tài khoản hoặc mật khẩu", 401);

  // If rememberMe is true, extend token expiration to 30 days, otherwise 2 hours
  const tokenExpiry = rememberMe ? "30d" : "2h";
  const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 60 * 60; // 30 days or 1 hour in seconds
  
  const token = signJwt({ sub: user.id!.toString(), email: user.email, name: user.name, id: user.id! }, tokenExpiry);
  await cacheUser(user);
  /* ✅ KHÔNG đưa token vào JSON */
  const res = createResponse(null, "Đăng nhập thành công");

  res.headers.set(
    "Set-Cookie",
    serialize("access_token", token, {
      domain: process.env.NODE_ENV === "production" ? ".aistudio.com.vn" : "localhost",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: cookieMaxAge,
    })
  );

  return res; // { success:true, data:null }
}

export const POST = withApiHandler(handler);
