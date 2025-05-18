import { NextRequest, NextResponse } from 'next/server';

export function withRoleGuard(req: NextRequest, res: NextResponse, requiredRoles: string[]): NextResponse {
  const role = req.cookies.get('role')?.value;

  if (!role || !requiredRoles.includes(role)) {
    console.warn(`Access denied: role "${role}" is not in allowed roles [${requiredRoles.join(', ')}]`);
    return NextResponse.redirect(new URL('/403', req.url));
  }

  return res;
}
