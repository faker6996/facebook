import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, LOCALE } from "@/lib/constants/enum";
import { SsoAuthToken } from "@/lib/models/sso_auth_token";
import { UserInfoSso } from "@/lib/models/user";
import { ssoGoogleApp } from "@/lib/modules/auth/sso_google/applications/sso_google_app";
import { callApi } from "@/lib/utils/api-client";
import { signJwt } from "@/lib/utils/jwt";
import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const AUTH_URL = process.env.FRONTEND_URL!;
const FRONTEND_REDIRECT = process.env.FRONTEND_URL || "http://localhost:3000/vi";

// STEP 1: Redirect user to Google login page
export async function POST(req: NextRequest) {
  const { locale } = await req.json();

  const redirect_uri = encodeURIComponent(`${AUTH_URL}${API_ROUTES.AUTH.SSO_GOOGLE}`);
  const client_id = GOOGLE_CLIENT_ID!;
  const scope = encodeURIComponent("email profile");
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=${locale}`;
  return NextResponse.json({ redirectUrl: url });
}

// STEP 2: Handle Google redirect with code and fetch access_token + user info
export async function GET(req: Request) {
  try {
    // 1. Lấy mã code từ query params
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const locale = searchParams.get("state") || LOCALE.VI;

    if (!code) {
      console.error("❌ Không có mã code từ Google");
      return new Response("Missing code", { status: 400 });
    }

    // 2. Đổi mã code lấy access_token
    const tokenData = await callApi<SsoAuthToken>(
      API_ROUTES.AUTH.SSO_GOOGLE_GET_TOKEN,
      HTTP_METHOD_ENUM.POST,
      new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${AUTH_URL!}${API_ROUTES.AUTH.SSO_GOOGLE}`,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    // 3. Lấy thông tin user từ access_token
    const userInfo = await callApi<UserInfoSso>(API_ROUTES.AUTH.SSO_GOOGLE_GET_INFO, HTTP_METHOD_ENUM.GET, undefined, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    // 4. Kiểm tra/tạo user trong DB
    const user = await ssoGoogleApp.handleAfterSso(userInfo);
    // Create JWT
    const token = signJwt(
      {
        sub: user.id!.toString(),
        email: user.email,
        name: user.name,
        id: user.id!,
      },
      "2h"
    );

    // Redirect with cookie
    const response = NextResponse.redirect(`${FRONTEND_REDIRECT}/${locale}`);
    response.headers.set(
      "Set-Cookie",
      serialize("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "none",
        maxAge: 60 * 60,
      })
    );

    return response;

    // 7. Redirect về trang chủ
  } catch (error: any) {
    return new Response("Lỗi trong quá trình đăng nhập Google", { status: 500 });
  }
}
