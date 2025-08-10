// app/api/auth/sessions/route.ts
import { NextRequest } from "next/server";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { sessionManager } from "@/lib/utils/session-manager";
import { verifyJwt } from "@/lib/utils/jwt";
import { ApiError } from "@/lib/utils/error";

// GET: Get all active sessions for current user
async function getHandler(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  
  if (!token) {
    throw new ApiError("Authentication required", 401);
  }

  // Validate session and get user ID
  const validation = await sessionManager.validateSession(token);
  
  if (!validation.isValid || !validation.userId) {
    throw new ApiError("Phiên đăng nhập đã hết hạn hoặc không hợp lệ", 401);
  }

  const userId = validation.userId;

  const sessions = await sessionManager.getUserActiveSessions(userId);
  
  return createResponse({
    sessions: sessions.map(session => ({
      sessionId: session.sessionId,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      lastActivity: session.updatedAt,
      expiresAt: session.expiresAt,
      isCurrentSession: false // We'll determine this on frontend
    })),
    totalSessions: sessions.length
  }, "Sessions retrieved successfully");
}

// DELETE: Invalidate specific session or all sessions
async function deleteHandler(req: NextRequest) {
  const currentToken = req.cookies.get("access_token")?.value;
  
  if (!currentToken) {
    throw new ApiError("Authentication required", 401);
  }

  // Validate session and get user ID
  const validation = await sessionManager.validateSession(currentToken);
  
  if (!validation.isValid || !validation.userId) {
    throw new ApiError("Phiên đăng nhập đã hết hạn hoặc không hợp lệ", 401);
  }

  const userId = validation.userId;

  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId');
  const action = url.searchParams.get('action'); // 'all' or 'others'

  let invalidatedCount = 0;

  if (action === 'all') {
    // Invalidate ALL sessions including current one
    invalidatedCount = await sessionManager.invalidateUserSessions(userId);
  } else if (action === 'others') {
    // Invalidate all sessions except current one
    invalidatedCount = await sessionManager.invalidateUserSessions(userId, currentToken);
  } else if (sessionId) {
    // Invalidate specific session (not implemented in current sessionManager, would need enhancement)
    throw new ApiError("Session-specific invalidation not implemented yet", 400);
  } else {
    throw new ApiError("Invalid action or sessionId required", 400);
  }

  return createResponse(
    { invalidatedCount },
    `${invalidatedCount} session(s) invalidated successfully`
  );
}

export const GET = withApiHandler(getHandler);
export const DELETE = withApiHandler(deleteHandler);