import { NextRequest, NextResponse } from 'next/server';

export function withRoleGuard(req: NextRequest, res: NextResponse, requiredRoles: string[]): NextResponse {
  const role = req.cookies.get('role')?.value;

  if (!role || !requiredRoles.includes(role)) {
    return NextResponse.redirect(new URL('/403', req.url));
  }

  return res;
}
