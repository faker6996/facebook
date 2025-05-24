import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";



const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
    const cookieStore = cookies();
    const token = (await cookieStore).get('access_token')?.value;
  
    if (!token) {
      return new NextResponse('Chưa đăng nhập', { status: 401 });
    }
  
    try {
      const user = jwt.verify(token, JWT_SECRET);
      return NextResponse.json(user);
    } catch (e) {
      return new NextResponse('Token không hợp lệ', { status: 401 });
    }
  }
  