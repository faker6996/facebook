import { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routeProtection } from "./lib/middlewares/route-protection";
import { middlewareRegistry } from "./lib/middlewares/extensions";
import { routing } from "@/i18n/routing";

/**
 * Internationalization middleware
 */
const intlMiddleware = createIntlMiddleware({
  ...routing,
  localeDetection: true,
  alternateLinks: true,
});

/**
 * Main middleware pipeline
 */
export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  try {
    // Handle API routes - no i18n needed
    if (pathname.startsWith("/api")) {
      return await routeProtection(req);
    }

    // Handle root path redirect to locale BEFORE route protection
    if (pathname === "/") {
      const acceptLanguage = req.headers.get("accept-language") || "";
      let detectedLocale = routing.defaultLocale;
      
      // Parse Accept-Language header
      if (acceptLanguage) {
        const preferredLocales = acceptLanguage
          .split(",")
          .map((lang) => lang.split(";")[0].trim().toLowerCase())
          .map((lang) => lang.split("-")[0]);

        for (const preferredLocale of preferredLocales) {
          if (routing.locales.includes(preferredLocale as (typeof routing.locales)[number])) {
            detectedLocale = preferredLocale as (typeof routing.locales)[number];
            break;
          }
        }
      }

      console.log(`🌐 Redirecting ${req.nextUrl.pathname} to /${detectedLocale} (detected from: ${acceptLanguage})`);
      return Response.redirect(new URL(`/${detectedLocale}`, req.url));
    }

    // Handle page routes with i18n + route protection
    const intlResponse = intlMiddleware(req);

    // If i18n middleware redirected, return that response
    if (intlResponse?.redirected) {
      return intlResponse;
    }

    // Apply route protection
    const protectionResponse = await routeProtection(req);

    // If route protection redirected, return that response
    if (protectionResponse.status >= 300 && protectionResponse.status < 400) {
      return protectionResponse;
    }

    // Merge i18n headers with protection response
    if (intlResponse?.headers) {
      intlResponse.headers.forEach((value, key) => {
        protectionResponse.headers.set(key, value);
      });
    }

    // Apply middleware extensions
    const finalResponse = await middlewareRegistry.executeAll(req, protectionResponse);

    return finalResponse;
  } catch (error) {
    console.error("[Middleware Pipeline Error]", error);

    // Graceful fallback
    if (pathname.startsWith("/api")) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Middleware error",
          code: "PIPELINE_ERROR",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }


    // For pages, try to redirect to error page
    return Response.redirect(new URL("/vi/error", req.url));
  }
}

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(vi|en)/:path*",

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
