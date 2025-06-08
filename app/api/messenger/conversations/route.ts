import { messengerApp } from "@/lib/modules/messenger/applications/messenger_app";
import { NextRequest, NextResponse } from "next/server";

// ✅ GET /api/messenger/recent?userId=1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const list = await messengerApp.getRecentConversations(userId);

    return NextResponse.json(list);
  } catch (err) {
    console.error("Messenger API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
