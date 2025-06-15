import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/utils/error";
import { createErrorResponse, createResponse } from "./response";

export function withApiHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const res = await handler(req);

      // Nếu không phải JSON → trả thẳng
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("application/json")) return res;

      const body = await res.clone().json();
      const okShape = body && typeof body === "object" && "success" in body && "message" in body && "data" in body;

      return okShape ? res : createResponse(body, "OK", res.status);
    } catch (err) {
      /* ---------- ①  LỖI NGHIỆP VỤ ---------- */
      if (err instanceof ApiError) {
        // ⚠️  HTTP 200 nhưng success=false
        //     Nếu muốn giữ mã 4xx, đặt status = err.status
        return createResponse(
          err.data ?? null,
          err.message,
          200, // luôn 200
          false // success = false
        );
      }

      /* ---------- ②  LỖI HỆ THỐNG ---------- */
      console.error("[Internal Error]", err);

      // Dev xem chi tiết, Prod giấu
      const message = process.env.NODE_ENV !== "production" ? (err as Error).message : "Internal Server Error";

      // HTTP 500, success=false
      return createErrorResponse(message, 500);
    }
  };
}
