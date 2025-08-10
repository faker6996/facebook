/**
 * Route Protection Middleware for Edge Runtime
 * 
 * Responsibilities:
 * - Protect private routes (redirect to login if no token)
 * - Allow public routes without authentication
 * - Handle locale-aware redirects
 * 
 * NOT responsible for:
 * - Session validation (handled by API route handlers)
 * - Token verification (handled by API route handlers)
 * - Database operations (Edge Runtime limitation)
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Configuration for route protection
 */
const ROUTE_CONFIG = {
  // Public routes that don't require authentication
  PUBLIC_ROUTES: [
    "/login",
    "/register", 
    "/forgot-password",
    "/reset-password",
    "/delete-data",
  ] as string[],
  
  // API routes that handle their own authentication
  PUBLIC_API_ROUTES: [
    "/api/auth/login",
    "/api/auth/logout",
    "/api/auth/sso_facebook", 
    "/api/auth/sso_google",
    "/api/forgot-password",
    "/api/reset-password",
    "/api/public",
  ] as string[],
  
  // Default locale for fallback
  DEFAULT_LOCALE: "vi" as const,
  
  // Supported locales
  SUPPORTED_LOCALES: ["vi", "en"] as const,
};

/**
 * Extract locale from pathname
 */
function extractLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  
  return ROUTE_CONFIG.SUPPORTED_LOCALES.includes(firstSegment as any) 
    ? firstSegment 
    : ROUTE_CONFIG.DEFAULT_LOCALE;
}

/**
 * Check if route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string, locale: string): boolean {
  return ROUTE_CONFIG.PUBLIC_ROUTES.some(route => 
    pathname === `/${locale}${route}` || pathname.startsWith(`/${locale}${route}/`)
  );
}

/**
 * Check if API route handles its own authentication
 */
function isPublicApiRoute(pathname: string): boolean {
  return ROUTE_CONFIG.PUBLIC_API_ROUTES.some(route => 
    pathname.startsWith(route)
  );
}

/**
 * Check if user has authentication token
 */
function hasAuthToken(req: NextRequest): boolean {
  const token = req.cookies.get("access_token")?.value;
  const hasToken = Boolean(token && token.trim().length > 0);
  console.log('🔍 Token check:', { hasToken, tokenLength: token?.length || 0 });
  return hasToken;
}

/**
 * Handle API route protection
 */
async function handleApiRoutes(req: NextRequest): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;
  
  // Allow public API routes
  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Check authentication for protected API routes
  if (!hasAuthToken(req)) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Authentication required",
        code: "AUTH_REQUIRED" 
      },
      { status: 401 }
    );
  }
  
  // Let API route handlers do detailed validation
  return NextResponse.next();
}

/**
 * Handle page route protection  
 */
async function handlePageRoutes(req: NextRequest): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;
  const locale = extractLocale(pathname);
  const hasToken = hasAuthToken(req);
  const isPublic = isPublicRoute(pathname, locale);
  
  // Redirect to login if no token and trying to access private route
  if (!hasToken && !isPublic) {
    console.log('🔒 No token detected, redirecting to login:', { pathname, locale, isPublic });
    const loginUrl = new URL(`/${locale}/login`, req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect to home if has token and trying to access login page
  if (hasToken && pathname === `/${locale}/login`) {
    return NextResponse.redirect(new URL(`/${locale}/home`, req.url));
  }
  
  return NextResponse.next();
}

/**
 * Main route protection middleware
 */
export async function routeProtection(req: NextRequest): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;
  
  try {
    // Handle API routes
    if (pathname.startsWith("/api")) {
      return await handleApiRoutes(req);
    }
    
    // Handle page routes
    return await handlePageRoutes(req);
    
  } catch (error) {
    console.error("[Route Protection Error]", error);
    
    // For API routes, return JSON error
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Internal server error",
          code: "MIDDLEWARE_ERROR" 
        },
        { status: 500 }
      );
    }
    
    // For page routes, redirect to error page
    const locale = extractLocale(pathname);
    return NextResponse.redirect(new URL(`/${locale}/error`, req.url));
  }
}

/**
 * Configuration for extending middleware
 */
export const middlewareConfig = {
  // Extend public routes
  addPublicRoute: (route: string) => {
    ROUTE_CONFIG.PUBLIC_ROUTES.push(route);
  },
  
  // Extend public API routes
  addPublicApiRoute: (route: string) => {
    ROUTE_CONFIG.PUBLIC_API_ROUTES.push(route);
  },
  
  // Get current config (for debugging)
  getConfig: () => ({ ...ROUTE_CONFIG }),
} as const;