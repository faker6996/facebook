import { NextRequest, NextResponse } from 'next/server';

let ipMap = new Map<string, { count: number; lastReset: number }>();
const WINDOW_MS = 60 * 1000; // 1 phút
const MAX_REQUESTS = 10;

export async function withRateLimit(req: NextRequest, res: NextResponse): Promise<NextResponse>{
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();

  const entry = ipMap.get(ip) || { count: 0, lastReset: now };
  if (now - entry.lastReset > WINDOW_MS) {
    entry.count = 0;
    entry.lastReset = now;
  }

  entry.count += 1;
  ipMap.set(ip, entry);

  if (entry.count > MAX_REQUESTS) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  return res;
}
