// app/api/messenger/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { messengerApp } from "@/lib/modules/messenger/applications/messenger_app";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { ApiError } from "@/lib/utils/error";

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  const lastMessageId = searchParams.get("lastMessageId");

  if (!conversationId) {
    throw new ApiError("Facebook user info request failed", 500);
  }

  const messages = await messengerApp.getMessagesAfterIdAsync(Number(conversationId), Number(lastMessageId));
  return createResponse(messages, "Thành công");
}
export const GET = withApiHandler(getHandler);
