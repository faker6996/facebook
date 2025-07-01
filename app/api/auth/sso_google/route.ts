import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, LOCALE } from "@/lib/constants/enum";
import { SsoAuthToken } from "@/lib/models/sso_auth_token";
import { UserInfoSso } from "@/lib/models/user";
import { ssoGoogleApp } from "@/lib/modules/auth/sso_google/applications/sso_google_app";
import { callApi } from "@/lib/utils/api-client";
import { signJwt } from "@/lib/utils/jwt";
import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { cacheUser } from "@/lib/cache/user";
import { ApiError } from "@/lib/utils/error";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const AUTH_URL = process.env.FRONTEND_URL!;
const FRONTEND_REDIRECT = process.env.FRONTEND_URL || "http://localhost:3000";

/* ------------------------------------------------------------------ */
/* STEP-1: Tạo URL redirect sang Google OAuth                         */
/* ------------------------------------------------------------------ */
async function postHandler(req: NextRequest) {
  const { locale } = await req.json();
  const redirect_uri = encodeURIComponent(`${AUTH_URL}${API_ROUTES.AUTH.SSO_GOOGLE}`);
  const client_id = GOOGLE_CLIENT_ID;
  const scope = encodeURIComponent("email profile");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=${locale}`;

  return NextResponse.json({ redirectUrl: url });
}

export const POST = withApiHandler(postHandler);

/* ------------------------------------------------------------------ */
/* STEP-2: Google redirect lại với mã code → lấy token + user info   */
/* ------------------------------------------------------------------ */
async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const locale = searchParams.get("state") || LOCALE.VI;
  if (!code) {
    return NextResponse.json({ message: "Missing code" }, { status: 400 });
  }

  // 1. Đổi mã code lấy access_token
  const tokenParams = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: `${AUTH_URL}${API_ROUTES.AUTH.SSO_GOOGLE}`,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenParams.toString(),
  });

  if (!tokenRes.ok) {
    throw new ApiError("Google token request failed", tokenRes.status);
  }

  const tokenData: SsoAuthToken = await tokenRes.json();

  // 2. Lấy thông tin user từ access_token
  const userInfoRes = await fetch(API_ROUTES.AUTH.SSO_GOOGLE_GET_INFO, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!userInfoRes.ok) {
    throw new ApiError("Failed to fetch user info from Google", userInfoRes.status);
  }

  const userInfo: UserInfoSso = await userInfoRes.json();

  // 3. Xử lý sau SSO (tạo/đồng bộ user)
  const user = await ssoGoogleApp.handleAfterSso(userInfo);

  // 4. Ghi vào Redis (tuỳ chọn)
  await cacheUser(user);

  // 5. Tạo JWT
  const token = signJwt(
    {
      sub: userInfo.id,
      email: user.email,
      name: user.name,
      id: user.id!,
    },
    "2h"
  );

  // 6. Set cookie và redirect
  const res = NextResponse.redirect(`${FRONTEND_REDIRECT}/${locale}`);
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

  return res;
}

export const GET = withApiHandler(getHandler);
