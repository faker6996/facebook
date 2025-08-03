// app/api/auth/me/route.ts              ⬅︎ đổi path tuỳ dự án
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { ApiError } from "@/lib/utils/error";
import { getCachedUser } from "@/lib/cache/user";
import { sessionManager } from "@/lib/utils/session-manager";

async function getHandler(req: NextRequest) {
  /* 1. Lấy token từ cookie */
  const token = (await cookies()).get("access_token")?.value;

  if (!token) throw new ApiError("Chưa đăng nhập", 401);

  /* 2. Validate session với database */
  const validation = await sessionManager.validateSession(token);
  
  if (!validation.isValid) {
    throw new ApiError("Phiên đăng nhập đã hết hạn hoặc không hợp lệ", 401);
  }

  /* 3. Get user data */
  let user;
  try {
    user = await getCachedUser(validation.userId!);
  } catch {
    throw new ApiError("Không thể lấy thông tin người dùng", 401);
  }

  /* 4. Trả kết quả chuẩn { success, message, data } */
  return createResponse(user, "Authenticated");
}

/* Xuất route GET đã bọc HOF */
export const GET = withApiHandler(getHandler);
