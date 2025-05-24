import { User } from "@/lib/models/user";
import { ssoFacebookApp } from "@/lib/modules/sso_facebook/applications/sso_facebook_app";
import { signJwt } from "@/lib/utils/jwt";
import axios from "axios";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID!;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET!;
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI!;
const JWT_SECRET = process.env.JWT_SECRET!;
const FRONTEND_REDIRECT = process.env.FRONTEND_URL || "http://localhost:3000/home";

// STEP 1: Redirect user to FACEBOOK login page
export async function POST() {
  const scope = "email,public_profile";
  const authURL = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`;
  return NextResponse.json({ redirectUrl: authURL });
}

// STEP 2: Handle FACEBOOK redirect with code and fetch access_token + user info
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing FACEBOOK code" }, { status: 400 });
  }

  try {
    // Get access_token from Facebook
    const tokenRes = await axios.get("https://graph.facebook.com/v12.0/oauth/access_token", {
      params: {
        client_id: FACEBOOK_CLIENT_ID,
        client_secret: FACEBOOK_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      },
    });

    const access_token = tokenRes.data.access_token;

    // Get user info from Facebook
    const userRes = await axios.get("https://graph.facebook.com/me", {
      params: {
        access_token,
        fields: "id,name,email",
      },
    });

    const userInfo = userRes.data;
    console.log("✅ Facebook user info:", userInfo);

    const user = await ssoFacebookApp.handleAfterSso(userInfo);

    // Create JWT
    const token = signJwt(
      {
        sub: userInfo.id, // dùng user ID
        email: user.email,
        name: user.name,
      },
      "2h"
    );

    // Redirect with cookie
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
  } catch (err: any) {
    console.error("❌ Facebook login error:", err.response?.data || err.message);
    return NextResponse.json({ error: "FACEBOOK login failed" }, { status: 500 });
  }
}
