/**
 * Simple Session-based Authentication Middleware for Edge Runtime
 * Basic token validation without database calls
 */

import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password", 
  "/reset-password",
  "/api/forgot-password",
  "/register",
  "/api/public",
  "/delete-data",
  "/api/auth/sso_facebook",
  "/api/auth/sso_google",
];

const API_AUTH_ROUTES = [
  "/api/auth/login",
  "/api/auth/logout", 
  "/api/auth/sso_facebook",
  "/api/auth/sso_google",
];

export async function simpleSessionAuth(req: NextRequest): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;
  
  // Debug logging
  if (pathname.startsWith('/api/auth')) {
    console.log('🔍 Middleware:', pathname, req.method);
  }
  
  // Skip session auth for public API auth routes
  if (API_AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    console.log('✅ Skipping auth for:', pathname);
    return NextResponse.next();
  }

  // Handle API routes - simple token check
  if (pathname.startsWith('/api')) {
    return await handleApiAuth(req);
  }

  // Handle page routes
  return await handlePageAuth(req);
}

async function handleApiAuth(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get("access_token")?.value;
  
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  // Simple JWT format validation (detailed validation happens in API handlers)
  if (!isValidJWTFormat(token)) {
    const response = NextResponse.json(
      { 
        success: false, 
        message: "Invalid token format",
        code: "TOKEN_INVALID"
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

  return NextResponse.next();
}

async function handlePageAuth(req: NextRequest): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;
  
  // Get locale from URL (e.g. /vi/login → locale = 'vi')
  const segments = pathname.split("/");
  const locale = segments[1] || "vi";

  const isPublic = PUBLIC_ROUTES.some((path) => pathname.startsWith(`/${locale}${path}`));
  const token = req.cookies.get("access_token")?.value;

  // If no token and not public route, redirect to login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  // If has token, do basic validation
  if (token) {
    // Simple JWT format validation
    if (!isValidJWTFormat(token)) {
      // Invalid token - clear cookie and redirect to login
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set('reason', 'invalid_token');
      
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

    // If valid token but trying to access login page, redirect to home
    if (isPublic && pathname.includes('/login')) {
      return NextResponse.redirect(new URL(`/${locale}/home`, req.url));
    }
  }

  return NextResponse.next();
}

/**
 * Simple JWT format validation (just check if it looks like a JWT)
 * Detailed validation happens in API handlers with database access
 */
function isValidJWTFormat(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Try to decode header and payload (just format check)
    JSON.parse(atob(parts[0]));
    JSON.parse(atob(parts[1]));
    
    return true;
  } catch {
    return false;
  }
}