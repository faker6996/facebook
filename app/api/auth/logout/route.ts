// app/api/auth/logout/route.ts
import { JwtPayload, verifyJwt } from "@/lib/utils/jwt";
import { invalidateUser } from "@/lib/cache/user";
import { serialize } from "cookie";
import { createResponse } from "@/lib/utils/response";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { NextRequest } from "next/server";

async function handler(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;

  if (token) {
    try {
      const payload = verifyJwt(token);
      if (payload?.sub) {
        await invalidateUser(Number(payload.sub));
      }
    } catch {}
  }

  const res = createResponse(null, "Đăng xuất thành công");
  res.headers.set(
    "Set-Cookie",
    serialize("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      expires: new Date(0),
    })
  );

  return res;
}

export const POST = withApiHandler(handler);
