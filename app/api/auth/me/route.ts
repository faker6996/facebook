// app/api/auth/me/route.ts              ⬅︎ đổi path tuỳ dự án
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { ApiError } from "@/lib/utils/error";

const JWT_SECRET = process.env.JWT_SECRET!;

async function getHandler(req: NextRequest) {
  /* 1. Lấy token từ cookie */
  const token = (await cookies()).get("access_token")?.value;
  if (!token) throw new ApiError("Chưa đăng nhập", 401);

  /* 2. Xác thực JWT */
  let user;
  try {
    user = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new ApiError("Token không hợp lệ", 401);
  }

  /* 3. Trả kết quả chuẩn { success, message, data } */
  return createResponse(user, "Authenticated");
}

/* Xuất route GET đã bọc HOF */
export const GET = withApiHandler(getHandler);
