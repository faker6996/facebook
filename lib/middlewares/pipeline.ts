import { NextRequest, NextResponse } from 'next/server';

export type Middleware = (req: NextRequest, res: NextResponse) => Promise<NextResponse>;

export async function middlewarePipeline(
  req: NextRequest,
  middlewares: Middleware[]
): Promise<NextResponse> {
  let res = NextResponse.next();
  for (const fn of middlewares) {
    res = await fn(req, res);
  }
  return res;
}
