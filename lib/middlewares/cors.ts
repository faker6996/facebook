import { NextRequest, NextResponse } from 'next/server';

export async function withCors(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}
