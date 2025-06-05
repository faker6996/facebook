import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
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
const FRONTEND_REDIRECT = process.env.FRONTEND_URL || "http://localhost:3000/home";

// STEP 1: Redirect user to FACEBOOK login page
export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing FACEBOOK code" }, { status: 400 });
  }

  try {
    // 🎟 Get access_token
    const tokenData = await callApi<SsoAuthToken>(API_ROUTES.AUTH.SSO_FACEBOOK_GET_TOKEN, HTTP_METHOD_ENUM.GET, {
      client_id: FACEBOOK_CLIENT_ID,
      client_secret: FACEBOOK_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
    });

    // 👤 Get user info
    const userInfo = await callApi<UserInfoSso>(API_ROUTES.AUTH.SSO_FACEBOOK_GET_INFO, HTTP_METHOD_ENUM.GET, {
      access_token: tokenData.access_token,
      fields: "id,name,email",
    });

    const user = await ssoFacebookApp.handleAfterSso(userInfo);

    const token = signJwt(
      {
        sub: userInfo.id,
        email: user.email,
        name: user.name,
      },
      "2h"
    );

    const response = NextResponse.redirect(FRONTEND_REDIRECT);
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
    return NextResponse.json({ error: "FACEBOOK login failed" }, { status: 500 });
  }
}
