// app/api/auth/login/route.ts
import { NextRequest } from "next/server";
import { serialize } from "cookie";

import { userApp } from "@/lib/modules/user/applications/user_app";
import { createResponse } from "@/lib/utils/response";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { ApiError } from "@/lib/utils/error";
import { normalLoginApp } from "@/lib/modules/auth/normal_login/applications/normal_login_app";
import { cacheUser } from "@/lib/cache/user";
import { sessionManager } from "@/lib/utils/session-manager";

async function handler(req: NextRequest) {
  console.log('🚀 Login API called');
  const { email, password, rememberMe } = await req.json();
  console.log('📝 Login data:', { email, rememberMe });

  const userVerify = await userApp.verifyUser(email, password);
  console.log('👤 User verified:', !!userVerify);
  
  const user = await normalLoginApp.handleAfterLogin(userVerify);
  console.log('✅ User processed:', { id: user?.id, email: user?.email });

  if (!user) throw new ApiError("Sai tài khoản hoặc mật khẩu", 401);

  // Extract device and IP information
  const deviceInfo = sessionManager.extractDeviceInfo(req);
  const ipAddress = sessionManager.getClientIP(req);
  const userAgent = req.headers.get('user-agent') || '';

  console.log('🔍 Login Debug:', {
    userId: user.id,
    email: user.email,
    deviceInfo,
    ipAddress,
    userAgent: userAgent.substring(0, 50) + '...'
  });

  // Create single session (this will invalidate all existing sessions for this user)
  console.log('🔄 About to create session for user:', user.id);
  
  let sessionResult;
  try {
    sessionResult = await sessionManager.createSingleSession({
      userId: user.id!,
      deviceInfo,
      ipAddress,
      userAgent,
      rememberMe
    });

    console.log('✅ Session created successfully:', {
      sessionId: sessionResult.sessionId,
      invalidatedCount: sessionResult.invalidatedCount
    });

    if (sessionResult.invalidatedCount > 0) {
      console.log('🔔 Invalidated sessions detected, SignalR notification should be sent');
    }
  } catch (sessionError) {
    console.error('❌ Session creation failed:', sessionError);
    throw new ApiError("Không thể tạo phiên đăng nhập", 500);
  }

  // Cache user data
  await cacheUser(user);

  // Calculate cookie max age
  const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 2 * 60 * 60; // 30 days or 2 hours in seconds
  
  const res = createResponse(
    {
      sessionInfo: {
        sessionId: sessionResult.sessionId,
        invalidatedSessions: sessionResult.invalidatedCount,
        expiresIn: rememberMe ? '30 days' : '2 hours'
      }
    }, 
    sessionResult.invalidatedCount > 0 
      ? `Đăng nhập thành công. ${sessionResult.invalidatedCount} phiên đăng nhập cũ đã được đóng.`
      : "Đăng nhập thành công"
  );

  res.headers.set(
    "Set-Cookie",
    serialize("access_token", sessionResult.sessionToken, {
      domain: process.env.NODE_ENV === "production" ? ".aistudio.com.vn" : "localhost",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: cookieMaxAge,
    })
  );

  return res;
}

export const POST = withApiHandler(handler);
