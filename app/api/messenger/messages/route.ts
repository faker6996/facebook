// app/api/messenger/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { messengerApp } from "@/lib/modules/messenger/applications/messenger_app";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  try {
    const messages = await messengerApp.getMessagesByConversationId(Number(conversationId));
    return NextResponse.json(messages);
  } catch (err) {
    console.error("Messenger API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
