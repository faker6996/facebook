import { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { middlewarePipeline } from "./lib/middlewares/pipeline";
import { withRoleGuard } from "./lib/middlewares/role-guard";
import { withCors, withLogger, withAuth } from "./lib/middlewares";
import { withRateLimit } from "./lib/middlewares/rate-limit";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(req: NextRequest) {
  try {
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
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
