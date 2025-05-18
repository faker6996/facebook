import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/api/public'];

export async function withAuth(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  debugger
  const isPublic = PUBLIC_ROUTES.some((path) => req.nextUrl.pathname.startsWith(path));
  const token = req.cookies.get('token')?.value;

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}
