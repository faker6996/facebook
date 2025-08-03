import { API_ROUTES } from "@/lib/constants/api-routes";
import { LOCALE } from "@/lib/constants/enum";
import { SsoAuthToken } from "@/lib/models/sso_auth_token";
import { UserInfoSsoGg } from "@/lib/models/user";
import { ssoGoogleApp } from "@/lib/modules/auth/sso_google/applications/sso_google_app";
import { ApiError } from "@/lib/utils/error";
import { signJwt } from "@/lib/utils/jwt";
import { sessionManager } from "@/lib/utils/session-manager";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";

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

// STEP 2: Handle Google redirect with code and fetch access_token + user info
async function getHandler(req: NextRequest) {
  // 1. Lấy mã code từ query params
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const locale = searchParams.get("state") || LOCALE.VI;

  if (!code) throw new ApiError("Missing code", 400);

  const tokenParams = new URLSearchParams({
    code,
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    redirect_uri: `${AUTH_URL}${API_ROUTES.AUTH.SSO_GOOGLE}`,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch(API_ROUTES.AUTH.SSO_GOOGLE_GET_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenParams, // KHÔNG JSON.stringify!
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    throw new ApiError(`Google token request failed: ${detail}`, tokenRes.status);
  }

  const tokenData: SsoAuthToken = await tokenRes.json(); // { access_token, refresh_token, ... }

  /* 3️⃣  Lấy thông tin user từ access_token (GET) */
  const infoRes = await fetch(`${API_ROUTES.AUTH.SSO_GOOGLE_GET_INFO}?alt=json`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!infoRes.ok) {
    const detail = await infoRes.text();
    throw new ApiError(`Google user-info request failed: ${detail}`, infoRes.status);
  }

  const userInfo: UserInfoSsoGg = await infoRes.json();

  // 4. Kiểm tra/tạo user trong DB
  const user = await ssoGoogleApp.handleAfterSso(userInfo);
  
  // 5. Tạo Single Session với database
  const sessionResult = await sessionManager.createSingleSession({
    userId: user.id!,
    deviceInfo: { browser: 'Google SSO', platform: 'Web' },
    ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'Google SSO',
    rememberMe: false
  });

  const token = sessionResult.sessionToken;
  // Redirect with cookie
  const response = NextResponse.redirect(`${FRONTEND_REDIRECT}/${locale}`);
  response.headers.set(
    "Set-Cookie",
    serialize("access_token", token, {
      domain: process.env.NODE_ENV === "production" ? ".aistudio.com.vn" : "localhost",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60,
    })
  );
  return response;
}

export const GET = withApiHandler(getHandler);
