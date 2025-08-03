// app/api/auth/sessions/extend/route.ts
import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { sessionManager } from "@/lib/utils/session-manager";
import { ApiError } from "@/lib/utils/error";

async function handler(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  
  if (!token) {
    throw new ApiError("Authentication required", 401);
  }

  const { extendMinutes = 120 } = await req.json().catch(() => ({}));

  const extended = await sessionManager.extendSession(token, extendMinutes);
  
  if (!extended) {
    throw new ApiError("Failed to extend session. Session may be invalid or expired.", 400);
  }

  return createResponse(
    { 
      extendedBy: extendMinutes,
      newExpiresAt: new Date(Date.now() + extendMinutes * 60 * 1000).toISOString()
    },
    `Session extended by ${extendMinutes} minutes`
  );
}

export const POST = withApiHandler(handler);