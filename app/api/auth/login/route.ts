import { userApp } from "@/lib/modules/user/applications/user_app";
import { hashPassword } from "@/lib/utils/hash";
import { signJwt } from "@/lib/utils/jwt";
import { serialize } from "cookie";
import { NextResponse } from "next/server";
const FRONTEND_REDIRECT = process.env.FRONTEND_URL || "http://localhost:3000/vi";

export async function POST(req: Request) {
  try {
    debugger;
    const body = await req.json();
    const { email, password, locale } = body;

    const user = await userApp.getUserGetByEmail(email);
    if (!user) {
      return Response.json({ message: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }
    const pass = await hashPassword(password);
    // Kiểm tra mật khẩu
    if (user.password !== pass) {
      return Response.json({ message: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }

    const token = signJwt(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        id: user.id!,
      },
      "2h"
    );

    const response = NextResponse.redirect(`${FRONTEND_REDIRECT}/${locale || "vi"}`);
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
