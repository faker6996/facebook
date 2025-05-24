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
  try {
    // Chạy các middleware theo pipeline
    let res = await middlewarePipeline(req, [
      withCors,
      // withRateLimit,   // bật khi cần
      withLogger,
      withAuth,
    ]);

    // Nếu truy cập /admin thì thêm role-guard
    if (req.nextUrl.pathname.startsWith('/admin')) {
      res = withRoleGuard(req, res, ['admin']);
    }

    return res;
  } catch (err: any) {
    // Log chi tiết để dev debug
    console.error('[Middleware Error]', err);

    // Trả về JSON thông báo lỗi chung
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
