// app/api/turn-cred/route.ts
import { NextResponse } from "next/server";

// Không cần thư viện crypto nữa

export async function GET() {
  // Trả về username và password tĩnh mà bạn đã định nghĩa
  // trong file turnserver.conf
  const credentials = {
    username: "adoria",
    password: "adoria@2025",
    // ttl không còn cần thiết nhưng có thể giữ lại
    ttl: 86400, // 24 hours
  };

  return NextResponse.json(credentials);
}
