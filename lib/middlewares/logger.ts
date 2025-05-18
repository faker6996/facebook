import { NextRequest, NextResponse } from 'next/server';

export async function withLogger(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.nextUrl.pathname}`);
  return res;
}
