// app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import { serialize } from "cookie";
import bcrypt from "bcrypt";

import { userApp } from "@/lib/modules/user/applications/user_app";
import { createResponse } from "@/lib/utils/response";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { ApiError } from "@/lib/utils/error";
import { normalLoginApp } from "@/lib/modules/auth/normal_login/applications/normal_login_app";
import { cacheUser } from "@/lib/cache/user";
import { sessionManager } from "@/lib/utils/session-manager";

async function handler(req: NextRequest) {
  console.log('🚀 Register API called');
  const { name, email, password } = await req.json();
  console.log('📝 Register data:', { name, email });

  // Validate input
  if (!name || !email || !password) {
    throw new ApiError("Vui lòng điền đầy đủ thông tin", 400);
  }

  if (password.length < 6) {
    throw new ApiError("Mật khẩu phải có ít nhất 6 ký tự", 400);
  }

  // Check if user already exists
  const existingUser = await userApp.getUserByEmail(email);
  if (existingUser) {
    throw new ApiError("Email đã tồn tại", 409);
  }

  console.log('✅ User validation passed');

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const newUser = await userApp.createUser({
    name,
    email,
    password: hashedPassword,
  });

  console.log('👤 User created:', { id: newUser?.id, email: newUser?.email });

  if (!newUser) {
    throw new ApiError("Không thể tạo tài khoản", 500);
  }

  // Process user after registration (similar to login flow)
  const user = await normalLoginApp.handleAfterLogin(newUser);
  console.log('✅ User processed:', { id: user?.id, email: user?.email });

  if (!user) {
    throw new ApiError("Không thể xử lý tài khoản sau khi tạo", 500);
  }

  // Extract device and IP information
  const deviceInfo = sessionManager.extractDeviceInfo(req);
  const ipAddress = sessionManager.getClientIP(req);
  const userAgent = req.headers.get('user-agent') || '';

  console.log('🔍 Register Debug:', {
    userId: user.id,
    email: user.email,
    deviceInfo,
    ipAddress,
    userAgent: userAgent.substring(0, 50) + '...'
  });

  // Create session for newly registered user
  console.log('🔄 About to create session for new user:', user.id);
  
  let sessionResult;
  try {
    sessionResult = await sessionManager.createSingleSession({
      userId: user.id!,
      deviceInfo,
      ipAddress,
      userAgent,
      rememberMe: false // Default to false for registration
    });

    console.log('✅ Session created successfully:', {
      sessionId: sessionResult.sessionId,
      invalidatedCount: sessionResult.invalidatedCount
    });
  } catch (sessionError) {
    console.error('❌ Session creation failed:', sessionError);
    throw new ApiError("Không thể tạo phiên đăng nhập", 500);
  }

  // Cache user data
  await cacheUser(user);

  // Calculate cookie max age (2 hours for registration)
  const cookieMaxAge = 2 * 60 * 60; // 2 hours in seconds
  
  const res = createResponse(
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      sessionInfo: {
        sessionId: sessionResult.sessionId,
        expiresIn: '2 hours'
      }
    }, 
    "Tạo tài khoản thành công"
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