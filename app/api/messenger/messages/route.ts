// app/api/messenger/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { messengerApp } from "@/lib/modules/messenger/applications/messenger_app";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  console.log("🚀 API /api/messenger/messages called with conversationId:", conversationId);

  if (!conversationId) {
    console.error("❌ Missing conversationId parameter");
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  try {
    console.log("🔄 Calling messengerApp.getMessagesByConversationId with:", Number(conversationId));
    const messages = await messengerApp.getMessagesByConversationId(Number(conversationId));
    console.log("✅ Retrieved messages count:", messages?.length);
    return createResponse(messages, "Thành công");
  } catch (error) {
    console.error("❌ Error in /api/messenger/messages:", error);
    console.error("❌ Error details:", {
      conversationId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Database error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
export const GET = withApiHandler(getHandler);
