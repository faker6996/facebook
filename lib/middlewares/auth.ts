import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/api/public', '/delete-data','/api/auth/sso_facebook'];

export async function withAuth(req: NextRequest, res: NextResponse): Promise<NextResponse> {


  const isPublic = PUBLIC_ROUTES.some((path) => req.nextUrl.pathname.startsWith(path));
  const token = req.cookies.get('access_token')?.value;
  console.log("Cookie from client:", req.cookies.get('access_token')?.value);


  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}
