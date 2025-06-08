import { NextRequest, NextResponse } from "next/server";
import { API_ROUTES } from "../constants/api-routes";

const PUBLIC_ROUTES = ["/login", "/register", "/api/public", "/delete-data", "/api/auth/sso_facebook", API_ROUTES.AUTH.SSO_GOOGLE];

export async function withAuth(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname;

  // Lấy locale từ URL (vd: /vi/login → locale = 'vi')
  const segments = pathname.split("/");
  const locale = segments[1] || "vi"; // fallback locale mặc định

  const isPublic = PUBLIC_ROUTES.some((path) => pathname.startsWith(`/${locale}${path}`));
  const token = req.cookies.get("access_token")?.value;

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  return res;
}
