import { NextRequest, NextResponse } from "next/server";
import { messengerApp } from "@/lib/modules/messenger/applications/messenger_app";
import { withApiHandler } from "@/lib/utils/withApiHandler";
import { createResponse } from "@/lib/utils/response";
import { Message } from "@/lib/models/message";
import { baseRepo } from "@/lib/modules/common/base_repo";
import { ApiError } from "@/lib/utils/error";
import { socketIO } from "@/lib/socket/socket";

async function getHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    const messages = await messengerApp.getMessagesByConversationId(Number(conversationId));
    return createResponse(messages, "Thành công");
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

async function postHandler(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, content, userId } = body;

    if (!conversationId || !content || !userId) {
      throw new ApiError("Thiếu conversationId, content hoặc userId");
    }

    // ❗ Nếu cần kiểm tra tham gia hội thoại, mở comment này
    // const existingParticipant = await baseRepo.findOne(ConversationParticipant, {
    //   where: { conversation_id: conversationId, user_id: userId },
    // });
    // if (!existingParticipant) throw new ApiError("Người dùng không thuộc cuộc trò chuyện");

    // Tạo tin nhắn mới
    const mes = new Message();
    mes.conversation_id = conversationId;
    mes.sender_id = userId;
    mes.content = content;
    mes.message_type = "text";

    const newMessage = await baseRepo.insert(mes);

    // ✅ Emit tin nhắn qua socket
    debugger;
    try {
      const io = socketIO.getIO(); // ✅ global._io
      io.to(String(conversationId)).emit("new-message", newMessage);
      console.log(`📡 Emit new-message tới phòng ${conversationId}`);
    } catch (err) {
      console.warn("⚠️ Không thể emit: Socket.IO chưa được khởi tạo trong server.ts");
    }

    return createResponse(newMessage, "Gửi tin nhắn thành công");
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// ✅ Đăng ký method
export const GET = withApiHandler(getHandler);
export const POST = withApiHandler(postHandler);
