import { NextRequest, NextResponse } from 'next/server';
import { middlewarePipeline } from './lib/middlewares/pipeline';
import { withRoleGuard } from './lib/middlewares/role-guard';

import {
  withCors,
  withLogger,
  withAuth,

} from './lib/middlewares';
import { withRateLimit } from './lib/middlewares/rate-limit';

export async function middleware(req: NextRequest) {
  debugger
  let res = await middlewarePipeline(req, [
    withCors,
    withRateLimit,
    withLogger,
    withAuth,
  ]);

  if (req.nextUrl.pathname.startsWith('/admin')) {
    res = withRoleGuard(req, res, ['admin']); // vẫn có thể đồng bộ
  }

  return res;
}


export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
