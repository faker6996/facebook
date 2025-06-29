// app/api/auth/sso_facebook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";

import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, LOCALE } from "@/lib/constants/enum";
import { SsoAuthToken } from "@/lib/models/sso_auth_token";
import { UserInfoSso } from "@/lib/models/user";

import { callApi } from "@/lib/utils/api-client";
import { signJwt } from "@/lib/utils/jwt";
import { createResponse } from "@/lib/utils/response";

import { withApiHandler } from "@/lib/utils/withApiHandler";
import { ApiError } from "@/lib/utils/error";
import { cacheUser } from "@/lib/cache/user";
import { saveToLocalStorage } from "@/lib/utils/local-storage";
import { ssoFacebookApp } from "@/lib/modules/auth/sso_facebook/applications/sso_facebook_app";

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID!;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET!;
const REDIRECT_URI = process.env.FRONTEND_URL! + API_ROUTES.AUTH.SSO_FACEBOOK;
const FRONTEND_REDIRECT = process.env.FRONTEND_URL || "http://localhost:3000";

/* ------------------------------------------------------------------ */
/* STEP-1: tạo URL redirect sang Facebook                              */
/* ------------------------------------------------------------------ */
async function postHandler(req: NextRequest) {
  const { locale } = await req.json();

  const scope = "email,public_profile";
  const authURL =
    `https://www.facebook.com/v12.0/dialog/oauth` +
    `?client_id=${FACEBOOK_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&state=${locale}`;

  // trả JSON theo chuẩn {success, message, data}
  return createResponse({ redirectUrl: authURL }, "Redirect URL created");
}

export const POST = withApiHandler(postHandler);

/* ------------------------------------------------------------------ */
/* STEP-2: Facebook gọi lại (redirect_uri)                             */
/* ------------------------------------------------------------------ */
async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const locale = searchParams.get("state") || LOCALE.VI;

  if (!code) throw new ApiError("Missing Facebook code", 400);

  /* 1️⃣  Đổi code → access_token */
  const tokenParams = new URLSearchParams({
    client_id: FACEBOOK_CLIENT_ID,
    client_secret: FACEBOOK_CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code,
  });

  const tokenRes = await fetch(`${API_ROUTES.AUTH.SSO_FACEBOOK_GET_TOKEN}?${tokenParams.toString()}`, { method: HTTP_METHOD_ENUM.GET });

  if (!tokenRes.ok) {
    throw new ApiError("Facebook token request failed", tokenRes.status);
  }

  const tokenData: SsoAuthToken = await tokenRes.json(); // { access_token, ... }

  /* 2️⃣  Lấy user info */
  const infoParams = new URLSearchParams({
    access_token: tokenData.access_token,
    fields: "id,name,email,picture.width(256).height(256)",
  });

  const infoRes = await fetch(`${API_ROUTES.AUTH.SSO_FACEBOOK_GET_INFO}?${infoParams.toString()}`, { method: HTTP_METHOD_ENUM.GET });

  if (!infoRes.ok) {
    throw new ApiError("Facebook user info request failed", infoRes.status);
  }

  const userInfo: UserInfoSso = await infoRes.json();

  /* 3. Xử lý sau SSO (tạo/đồng bộ user) */
  const user = await ssoFacebookApp.handleAfterSso(userInfo);

  // ✅ Ghi vào Redis
  await cacheUser(user);

  /* 4. Tạo JWT & redirect */
  const token = signJwt(
    {
      sub: user.id!.toString(),
      email: user.email,
      name: user.name,
      id: user.id!,
    },
    "2h"
  );
  const res = NextResponse.redirect(`${FRONTEND_REDIRECT}/${locale}`);
  res.headers.set(
    "Set-Cookie",
    serialize("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // secure: true,
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60,
    })
  );

  return res; // content-type không phải JSON → HOF sẽ “bypass”
}

export const GET = withApiHandler(getHandler);
