// app/api/messenger/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { messengerApp } from "@/lib/modules/messenger/applications/messenger_app";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "30";

  console.log("🚀 API /api/messenger/messages called with:", {
    conversationId,
    page,
    limit
  });

  if (!conversationId) {
    console.error("❌ Missing conversationId parameter");
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  // Validate pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return NextResponse.json({ error: "Invalid page parameter" }, { status: 400 });
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return NextResponse.json({ error: "Invalid limit parameter (1-100)" }, { status: 400 });
  }

  try {
    console.log("🔄 Calling messengerApp.getMessagesByConversationId with:", {
      conversationId: Number(conversationId),
      page: pageNum,
      limit: limitNum
    });
    
    const result = await messengerApp.getMessagesByConversationId(
      Number(conversationId), 
      pageNum, 
      limitNum
    );
    
    console.log("✅ Retrieved messages:", {
      count: result?.messages?.length,
      hasMore: result?.hasMore,
      totalCount: result?.totalCount,
      page: pageNum
    });
    
    return createResponse(result, "Thành công");
  } catch (error) {
    console.error("❌ Error in /api/messenger/messages:", error);
    console.error("❌ Error details:", {
      conversationId,
      page,
      limit,
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
