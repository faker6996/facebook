import { userApp } from "@/lib/modules/user/applications/user_app";
import { comparePassword, hashPassword } from "@/lib/utils/hash";
import { signJwt } from "@/lib/utils/jwt";
import { serialize } from "cookie";
import { NextResponse } from "next/server";
const FRONTEND_REDIRECT = process.env.FRONTEND_URL || "http://localhost:3000/vi";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, locale } = body;

    const user = await userApp.verifyUser(email, password);
    const token = signJwt(
      {
        sub: user.id?.toString(),
        email: user.email,
        name: user.name,
        id: user.id!,
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
  } catch (error: any) {
    console.error("Login error:", error);
    return Response.json({ message: "Lỗi hệ thống, vui lòng thử lại sau." }, { status: 500 });
  }
}
