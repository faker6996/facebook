"use client";

// ----- Imports -----
import React, { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { Video } from "lucide-react";

// Local Imports
import MessageList from "@/components/messenger/MessageList";
import { Avatar } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import VideoCallWindow from "./VideoCallWindow"; // Component mới
import IncomingCallModal from "./IncomingCallModal"; // Component mới
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM, MESSAGE_TYPE } from "@/lib/constants/enum";
import { Message, SendMessageRequest } from "@/lib/models/message";
import type { MessengerPreview } from "@/lib/models/messenger_review";
import { User } from "@/lib/models/user";
import { callApi } from "@/lib/utils/api-client";
import { loadFromLocalStorage } from "@/lib/utils/local-storage";

// ----- Props Interface -----
interface Props {
  conversation: MessengerPreview;
  onClose: (conversationId: number) => void;
  style?: React.CSSProperties;
}

// ----- WebRTC Configuration -----
const rtcConfig: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// ----- Component Definition -----
export default function MessengerContainer({ conversation, onClose, style }: Props) {
  // ----- State cho Chat -----
  const [sender, setSender] = useState<User>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // ----- State cho Video Call -----
  const [signalRConnection, setSignalRConnection] = useState<signalR.HubConnection | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ callerId: string; offer: any } | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // ----- Helper Functions for Video Call -----
  const cleanupCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsCalling(false);
    setIncomingCall(null);
  };

  const createPeerConnection = async (callerIdForAnswer?: string) => {
    console.log("callerIdForAnswer", callerIdForAnswer);
    console.log("conversation.other_user_id", conversation.other_user_id);
    const targetUserId = callerIdForAnswer || conversation.other_user_id?.toString();
    if (!targetUserId) return null;

    const pc = new RTCPeerConnection(rtcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signalRConnection?.invoke("SendIceCandidate", targetUserId, JSON.stringify(event.candidate));
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    } catch (error) {
      console.error("Không thể truy cập camera/microphone:", error);
      cleanupCall();
      return null;
    }

    peerConnectionRef.current = pc;
    return pc;
  };

  // ----- Call Flow Functions -----
  const initiateCall = async () => {
    // THÊM ĐOẠN KIỂM TRA NÀY
    console.log("Current SignalR State:", signalRConnection?.state);
    if (!signalRConnection || signalRConnection.state !== "Connected") {
      alert("Lỗi: Kết nối SignalR chưa sẵn sàng. Vui lòng thử lại.");
      return;
    }
    debugger;
    const pc = await createPeerConnection();
    if (!pc) return;

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    setIsCalling(true);
    await signalRConnection?.invoke("SendCallOffer", conversation.other_user_id?.toString(), JSON.stringify(offer));
  };

  const answerCall = async () => {
    if (!incomingCall) return;
    const pc = await createPeerConnection(incomingCall.callerId);
    if (!pc) return;

    await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    setIsCalling(true);
    setIncomingCall(null);

    await signalRConnection?.invoke("SendCallAnswer", incomingCall.callerId, JSON.stringify(answer));
  };

  const declineCall = () => {
    if (incomingCall) {
      signalRConnection?.invoke("EndCall", incomingCall.callerId);
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    const targetUserId = incomingCall?.callerId || conversation.other_user_id?.toString();
    if (targetUserId) {
      signalRConnection?.invoke("EndCall", targetUserId);
    }
    cleanupCall();
  };

  // ----- useEffect Hooks -----

  // Load tin nhắn ban đầu
  useEffect(() => {
    if (!conversation?.conversation_id) return;
    const currentUser = loadFromLocalStorage("user", User);
    setSender(currentUser ?? {});

    let isMounted = true;
    (async () => {
      try {
        const response = await callApi<Message[]>(API_ROUTES.MESSENGER.MESSAGES(conversation.conversation_id ?? 0), HTTP_METHOD_ENUM.GET);
        if (isMounted) setMessages(response?.map((msgData) => new Message(msgData)) ?? []);
      } catch (err) {
        console.error("Lỗi tải tin nhắn:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [conversation?.conversation_id]);

  // Thiết lập SignalR
  useEffect(() => {
    if (!sender?.id || !conversation?.other_user_id) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/chathub`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();
    setSignalRConnection(conn);

    // Lắng nghe sự kiện Chat
    conn.on("ReceiveMessage", (newMessageData: any) => {
      const isMessageForCurrentConversation =
        (newMessageData.sender_id === conversation.other_user_id && newMessageData.target_id === sender.id) ||
        (newMessageData.sender_id === sender.id && newMessageData.target_id === conversation.other_user_id);
      if (isMessageForCurrentConversation) {
        setMessages((prev) => [...prev, new Message(newMessageData)]);
      }
    });

    // Lắng nghe sự kiện Reconnect (đồng bộ chat)
    conn.onreconnected(async (connectionId) => {
      console.log(`✅ SignalR reconnected với connectionId: ${connectionId}`);

      // Lấy ID của tin nhắn cuối cùng mà client đã nhận được
      // Chúng ta chỉ lấy ID dạng số, bỏ qua các ID tạm thời dạng string
      const lastMessageId =
        messages
          .slice()
          .reverse()
          .find((m) => typeof m.id === "number")?.id ?? 0;

      console.log(`Đang đồng bộ tin nhắn từ sau ID: ${lastMessageId}`);

      try {
        // Gọi API sync để lấy các tin nhắn đã lỡ
        const missedMessages = await callApi<Message[]>(
          `${API_ROUTES.MESSENGER.SYNC}?conversationId=${conversation.conversation_id}&lastMessageId=${lastMessageId}`,
          HTTP_METHOD_ENUM.GET
        );

        if (missedMessages && missedMessages.length > 0) {
          console.log(`Tìm thấy ${missedMessages.length} tin nhắn đã lỡ.`);
          // Chuyển đổi dữ liệu thô thành instance của class Message
          const missedMessageInstances = missedMessages.map((m) => new Message(m));

          // Thêm các tin nhắn đã lỡ vào state và sắp xếp lại để đảm bảo thứ tự
          setMessages((prevMessages) =>
            [...prevMessages, ...missedMessageInstances].sort(
              (a, b) => new Date(a.created_at ?? "").getTime() - new Date(b.created_at ?? "").getTime()
            )
          );
        } else {
          console.log("Không có tin nhắn nào bị lỡ.");
        }
      } catch (error) {
        console.error("Lỗi khi đồng bộ tin nhắn đã lỡ:", error);
      }
    });

    // Lắng nghe sự kiện Video Call
    conn.on("ReceiveCallOffer", (callerId, offer) => setIncomingCall({ callerId, offer: JSON.parse(offer) }));
    conn.on("ReceiveCallAnswer", async (answer) => peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer))));
    conn.on("ReceiveIceCandidate", (candidate) => peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(JSON.parse(candidate))));
    conn.on("CallEnded", cleanupCall);

    conn.start().catch((err) => console.error("Kết nối SignalR thất bại: ", err));

    return () => {
      conn.stop();
      cleanupCall();
    };
  }, [sender.id, conversation.other_user_id]);

  // Cuộn xuống cuối
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Gửi tin nhắn đến server
  const performSendMessage = async (content: string, tempId: string) => {
    const body: SendMessageRequest = {
      sender_id: sender.id!,
      content: content,
      conversation_id: conversation.conversation_id!,
      message_type: MESSAGE_TYPE.PRIVATE,
      target_id: conversation.other_user_id,
    };

    try {
      const response = await callApi<Message>(`${API_ROUTES.CHAT_SERVER.SENT_MESSAGE}`, HTTP_METHOD_ENUM.POST, body);
      const savedMessage = new Message(response);
      // Cập nhật tin nhắn tạm thời thành tin nhắn đã lưu
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? savedMessage : msg)));
    } catch (err) {
      console.error("Gửi tin nhắn thất bại:", err);
      // Đánh dấu tin nhắn là gửi thất bại
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? new Message({ ...msg, status: "Failed" }) : msg)));
    }
  };

  // Xử lý gửi tin nhắn từ form
  const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || !sender.id) return;

    const temporaryId = `temp_${Date.now()}`;
    const content = input.trim();
    const optimisticMessage = new Message({
      id: temporaryId,
      sender_id: sender.id,
      target_id: conversation.other_user_id,
      content: content,
      message_type: "text",
      created_at: new Date().toISOString(),
      status: "Sending", // Trạng thái đang gửi
    });

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput(""); // Xóa input

    performSendMessage(content, temporaryId);
  };

  // Xử lý gửi lại tin nhắn bị lỗi
  const handleRetrySend = (failedMessage: Message) => {
    if (!failedMessage.content) return;

    // Xóa tin nhắn bị lỗi cũ khỏi danh sách
    setMessages((prev) => prev.filter((m) => m.id !== failedMessage.id));

    const temporaryId = `temp_${Date.now()}`;
    const optimisticMessage = new Message({
      ...failedMessage,
      id: temporaryId,
      status: "Sending",
      created_at: new Date().toISOString(),
    });

    setMessages((prev) => [...prev, optimisticMessage]);
    performSendMessage(failedMessage.content, temporaryId);
  };

  // ----- JSX Render -----
  // ----- JSX Render -----
  return (
    // Sử dụng React Fragment để chứa nhiều component ở cấp cao nhất
    <>
      {/* ===== 1. CỬA SỔ CHAT CHÍNH ===== */}
      <div
        className="fixed bottom-4 z-40 flex w-full max-w-[320px] flex-col overflow-hidden rounded-xl border bg-card shadow-lg max-h-[500px]"
        style={style}
      >
        {/* --- Header của cửa sổ chat --- */}
        <div className="flex items-center justify-between gap-2 border-b bg-muted px-4 py-3">
          {/* Thông tin người nhận */}
          <div className="flex items-center gap-2">
            <Avatar src={conversation.avatar_url ?? "/avatar.png"} size="sm" />
            <div>
              <p className="text-sm font-semibold">{conversation.other_user_name}</p>
              <p className="text-xs text-muted-foreground">Đang hoạt động</p>
            </div>
          </div>
          {/* Các nút hành động */}
          <div className="flex items-center">
            <Button size="icon" variant="ghost" onClick={initiateCall}>
              <Video className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onClose(conversation.conversation_id!)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* --- Khu vực hiển thị tin nhắn --- */}
        <ScrollArea className="h-[300px] space-y-2 overflow-y-auto p-4">
          <MessageList messages={messages} senderId={sender.id} onRetrySend={handleRetrySend} />
          <div ref={bottomRef} />
        </ScrollArea>

        {/* --- Form nhập và gửi tin nhắn --- */}
        <form onSubmit={sendMessage} className="flex gap-2 border-t bg-muted p-4">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập tin nhắn..." />
          <Button type="submit">Gửi</Button>
        </form>
      </div>

      {/* ===== 2. CỬA SỔ VIDEO CALL (HIỂN THỊ CÓ ĐIỀU KIỆN) ===== */}
      {/* Component này chỉ hiện ra khi state 'isCalling' là true */}
      {isCalling && <VideoCallWindow localStream={localStream} remoteStream={remoteStream} onEndCall={endCall} />}

      {/* ===== 3. MODAL CUỘC GỌI ĐẾN (HIỂN THỊ CÓ ĐIỀU KIỆN) ===== */}
      {/* Component này chỉ hiện ra khi state 'incomingCall' có giá trị */}
      {incomingCall && (
        <IncomingCallModal callerName={conversation.other_user_name ?? "Một người dùng"} onAccept={answerCall} onDecline={declineCall} />
      )}
    </>
  );
}
