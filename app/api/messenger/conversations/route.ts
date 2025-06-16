import { messengerApp } from "@/lib/modules/messenger/applications/messenger_app";
import { createResponse } from "@/lib/utils/response";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { NextRequest, NextResponse } from "next/server";

// ✅ GET /api/messenger/recent?userId=1
async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("userId"));

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const list = await messengerApp.getRecentConversations(userId);

  return createResponse(list, "Thành công");
}
export const GET = withApiHandler(getHandler);
