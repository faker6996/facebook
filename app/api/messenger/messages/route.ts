// app/api/messenger/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { messengerApp } from "@/lib/modules/messenger/applications/messenger_app";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const messages = await messengerApp.getMessagesByConversationId(Number(conversationId));
  return createResponse(messages, "Thành công");
}
export const GET = withApiHandler(getHandler);
