/**
 * Session-based Authentication Middleware
 * Validates single sessions and prevents multiple concurrent sessions
 * 
 * Note: This middleware uses Node.js APIs and should not run on Edge Runtime
 */

import { NextRequest, NextResponse } from "next/server";
import { sessionManager } from "../utils/session-manager";
import { API_ROUTES } from "../constants/api-routes";

const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password", 
  "/reset-password",
  "/api/forgot-password",
  "/register",
  "/api/public",
  "/delete-data",
  "/api/auth/sso_facebook",
  API_ROUTES.AUTH.SSO_GOOGLE,
];

const API_AUTH_ROUTES = [
  "/api/auth/login",
  "/api/auth/logout", 
  "/api/auth/sso_facebook",
  "/api/auth/sso_google",
];

export async function withSessionAuth(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;
  
  // Skip session auth for public API auth routes
  if (API_AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    return res;
  }

  // Handle API routes
  if (pathname.startsWith('/api')) {
    return await handleApiSessionAuth(req, res);
  }

  // Handle page routes
  return await handlePageSessionAuth(req, res);
}

async function handleApiSessionAuth(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  const token = req.cookies.get("access_token")?.value;
  
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  // Validate session
  const validation = await sessionManager.validateSession(token);
  
  if (!validation.isValid) {
    // Invalid session - clear cookie and return unauthorized
    const response = NextResponse.json(
      { 
        success: false, 
        message: "Session expired or invalid. Please login again.",
        code: "SESSION_INVALID"
      },
      { status: 401 }
    );
    
    // Clear the invalid cookie
    response.cookies.set("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      expires: new Date(0),
    });
    
    return response;
  }

  // Extend session if it's about to expire (less than 30 minutes left)
  if (validation.expiresAt) {
    const minutesLeft = (validation.expiresAt.getTime() - Date.now()) / (1000 * 60);
    if (minutesLeft < 30) {
      await sessionManager.extendSession(token, 120); // Extend by 2 hours
    }
  }

  // Add user info to request headers for downstream usage
  const newHeaders = new Headers(req.headers);
  newHeaders.set('x-user-id', validation.userId!.toString());
  
  return NextResponse.next({
    request: {
      headers: newHeaders,
    },
  });
}

async function handlePageSessionAuth(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;
  
  // Get locale from URL (e.g. /vi/login → locale = 'vi')
  const segments = pathname.split("/");
  const locale = segments[1] || "vi"; // fallback locale default

  const isPublic = PUBLIC_ROUTES.some((path) => pathname.startsWith(`/${locale}${path}`));
  const token = req.cookies.get("access_token")?.value;

  // If no token and not public route, redirect to login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  // If has token, validate it
  if (token) {
    const validation = await sessionManager.validateSession(token);
    
    if (!validation.isValid) {
      // Invalid session - clear cookie and redirect to login
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set('reason', 'session_expired');
      
      const response = NextResponse.redirect(loginUrl);
      
      // Clear the invalid cookie
      response.cookies.set("access_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        expires: new Date(0),
      });
      
      return response;
    }

    // If valid session but trying to access login page, redirect to home
    if (isPublic && pathname.includes('/login')) {
      return NextResponse.redirect(new URL(`/${locale}/home`, req.url));
    }

    // Extend session if needed
    if (validation.expiresAt) {
      const minutesLeft = (validation.expiresAt.getTime() - Date.now()) / (1000 * 60);
      if (minutesLeft < 30) {
        await sessionManager.extendSession(token, 120);
      }
    }
  }

  return res;
}

/**
 * Helper function to extract user ID from request (for API routes)
 */
export function getUserIdFromRequest(req: NextRequest): number | null {
  const userId = req.headers.get('x-user-id');
  return userId ? parseInt(userId) : null;
}

/**
 * Helper function to check if current session is valid (for components)
 */
export async function getCurrentSession(token: string) {
  if (!token) {
    return { isValid: false, user: null };
  }

  const validation = await sessionManager.validateSession(token);
  
  if (!validation.isValid) {
    return { isValid: false, user: null };
  }

  return {
    isValid: true,
    userId: validation.userId,
    expiresAt: validation.expiresAt
  };
}

/**
 * Middleware function to be used in middleware.ts
 */
export async function sessionAuthMiddleware(req: NextRequest): Promise<NextResponse> {
  return withSessionAuth(req, NextResponse.next());
}