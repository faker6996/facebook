// app/api/auth/logout/route.ts
import { invalidateUser } from "@/lib/cache/user";
import { serialize } from "cookie";
import { createResponse } from "@/lib/utils/response";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { NextRequest } from "next/server";
import { sessionManager } from "@/lib/utils/session-manager";
import { verifyJwt } from "@/lib/utils/jwt";

async function handler(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  let logoutMessage = "Đăng xuất thành công";

  if (token) {
    try {
      // Invalidate the specific session
      const sessionInvalidated = await sessionManager.invalidateSession(token);
      
      // Also try to get user ID and invalidate cache
      const payload = verifyJwt(token);
      if (payload?.sub) {
        await invalidateUser(Number(payload.sub));
      }

      if (sessionInvalidated) {
        logoutMessage = "Đã đăng xuất và hủy phiên làm việc thành công";
      }
    } catch (error) {
      console.error("❌ Error during logout:", error);
      // Continue with logout even if session invalidation fails
    }
  }

  const res = createResponse(null, logoutMessage);
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
