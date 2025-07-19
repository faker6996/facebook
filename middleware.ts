import { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { middlewarePipeline } from "./lib/middlewares/pipeline";
import { withRoleGuard } from "./lib/middlewares/role-guard";
import { withCors, withLogger, withAuth } from "./lib/middlewares";
import { withRateLimit } from "./lib/middlewares/rate-limit";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware({
  ...routing,
  // Enhanced locale detection 
  localeDetection: true,
  alternateLinks: true
});

export async function middleware(req: NextRequest) {
  try {
    // Skip i18n for API routes
    if (req.nextUrl.pathname.startsWith('/api')) {
      return await middlewarePipeline(req, [
        withCors,
        withLogger,
        withAuth,
      ]);
    }

    const intlRes = intlMiddleware(req);
    if (intlRes?.redirected) return intlRes;

    let res = await middlewarePipeline(req, [
      withCors,
      // withRateLimit,
      withLogger,
      withAuth,
    ]);

    intlRes?.headers.forEach((value, key) => {
      res.headers.set(key, value);
    });

    if (req.nextUrl.pathname.startsWith("/admin")) {
      res = withRoleGuard(req, res, ["admin"]);
    }

    return res;
  } catch (err: any) {
    console.error("[Middleware Error]", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(vi|en)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)']
};
