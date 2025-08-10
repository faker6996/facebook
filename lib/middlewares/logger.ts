import { NextRequest, NextResponse } from 'next/server';

export async function withLogger(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  return res;
}
