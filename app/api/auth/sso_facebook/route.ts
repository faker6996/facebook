import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, LOCALE } from "@/lib/constants/enum";
import { SsoAuthToken } from "@/lib/models/sso_auth_token";
import { UserInfoSso } from "@/lib/models/user";
import { ssoFacebookApp } from "@/lib/modules/sso_facebook/applications/sso_facebook_app";
import { callApi } from "@/lib/utils/api-client";
import { signJwt } from "@/lib/utils/jwt";
import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID!;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET!;
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI!;
const FRONTEND_REDIRECT = process.env.FRONTEND_URL || "http://localhost:3000";

// --- STEP 1: Redirect to Facebook Login ---
export async function POST(req: NextRequest) {
  const { locale } = await req.json();

  const scope = "email,public_profile";
  const authURL =
    `https://www.facebook.com/v12.0/dialog/oauth` +
    `?client_id=${FACEBOOK_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&state=${locale}`;

  return NextResponse.json({ redirectUrl: authURL });
}

// --- STEP 2: Handle Facebook Redirect + Get AccessToken ---
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const locale = searchParams.get("state") || LOCALE.VI;

  if (!code) {
    return NextResponse.json({ error: "Missing FACEBOOK code" }, { status: 400 });
  }

  try {
    // Exchange code for access_token
    const tokenData = await callApi<SsoAuthToken>(API_ROUTES.AUTH.SSO_FACEBOOK_GET_TOKEN, HTTP_METHOD_ENUM.GET, {
      client_id: FACEBOOK_CLIENT_ID,
      client_secret: FACEBOOK_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI, // must match exactly
      code,
    });

    // Fetch user info from Facebook
    const userInfo = await callApi<UserInfoSso>(API_ROUTES.AUTH.SSO_FACEBOOK_GET_INFO, HTTP_METHOD_ENUM.GET, {
      access_token: tokenData.access_token,
      fields: "id,name,email",
    });

    const user = await ssoFacebookApp.handleAfterSso(userInfo);

    // Generate JWT
    const token = signJwt(
      {
        sub: userInfo.id,
        email: user.email,
        name: user.name,
      },
      "2h"
    );

    // Redirect to locale home page
    const response = NextResponse.redirect(`${FRONTEND_REDIRECT}/${locale}`);
    response.headers.set(
      "Set-Cookie",
      serialize("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60,
      })
    );

    return response;
  } catch (err) {
    console.error("[Facebook SSO Error]", err);
    return NextResponse.json({ error: "Facebook login failed" }, { status: 500 });
  }
}
