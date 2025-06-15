// lib/utils/response.ts
import { NextResponse } from "next/server";

export function createResponse<T>(
  data: T,
  message = "OK",
  status = 200,
  success = true // ✨ thêm tham số
) {
  return NextResponse.json({ success, message, data }, { status });
}

export function createErrorResponse(message = "Internal Server Error", status = 500, data: any = null) {
  return createResponse(data, message, status, /* success= */ false);
}
