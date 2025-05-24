import { NextRequest, NextResponse } from "next/server";
import { API_ROUTES } from "../constants/api-routes";

const PUBLIC_ROUTES = ["/login", "/register", "/api/public", "/delete-data", "/api/auth/sso_facebook", API_ROUTES.AUTH.SSO_GOOGLE];

export async function withAuth(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  const isPublic = PUBLIC_ROUTES.some((path) => req.nextUrl.pathname.startsWith(path));
  const token = req.cookies.get("access_token")?.value;

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}
