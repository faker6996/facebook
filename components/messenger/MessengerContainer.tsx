"use client";

// ----- Imports -----
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { Video } from "lucide-react";

// Local Imports
import MessageList from "@/components/messenger/MessageList";
import { Avatar } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/ScrollArea";
import VideoCallWindow from "./VideoCallWindow";
import IncomingCallModal from "./IncomingCallModal";
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
  const [incomingCall, setIncomingCall] = useState<{ callerId: string; offer: RTCSessionDescriptionInit } | null>(null);

  // Dùng useState cho remote stream để kích hoạt re-render
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // ----- Helper Functions for Video Call -----
  const cleanupCall = useCallback(() => {
    console.log("🧹 Dọn dẹp cuộc gọi...");
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach((sender) => {
        sender.track?.stop();
      });
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Reset state của remote stream
    setRemoteStream(null);

    setIsCalling(false);
    setIncomingCall(null);
  }, []);

  /* ================== Factory ================== */
  const createPeerConnection = async (targetUserId: string): Promise<RTCPeerConnection | null> => {
    console.log(`🌀 Tạo PeerConnection cho target: ${targetUserId}`);
    const pc = new RTCPeerConnection(rtcConfig);

    pc.oniceconnectionstatechange = () => {
      console.log(`❄️ TRẠNG THÁI ICE: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
        console.warn("ICE connection failed or disconnected. Ending call.");
        cleanupCall();
      }
    };
    pc.onsignalingstatechange = () => console.log("🔹 Signaling:", pc.signalingState);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log("🔸 Send ICE candidate:", e.candidate.candidate);
        signalRConnection?.invoke("SendIceCandidate", targetUserId, JSON.stringify(e.candidate));
      } else {
        console.log("🔸 ICE gathering complete.");
      }
    };

    pc.ontrack = (e) => {
      console.log("✅✅✅ SỰ KIỆN ONTRACK ĐÃ CHẠY! ✅✅✅");
      console.log("Stream nhận được:", e.streams[0]);
      console.log("Loại track:", e.track.kind);
      if (e.streams && e.streams[0]) {
        // Dùng setState để cập nhật remote stream
        setRemoteStream(e.streams[0]);
      }
    };

    try {
      // Nếu localStreamRef.current đã có, vẫn phải addTrack vào peerConnection mới
      if (!localStreamRef.current || localStreamRef.current.getTracks().length === 0) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log(
          "🎥 Lấy được local stream:",
          stream.getTracks().map((t) => t.kind)
        );
        localStreamRef.current = stream;
      }
      // Luôn addTrack vào peerConnection mới (kể cả khi localStreamRef.current đã có)
      localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));
    } catch (err) {
      console.error("🚫🚫🚫 LỖI TRUY CẬP CAMERA/MIC:", err);
      return null;
    }

    return pc;
  };

  // ----- Call Flow Functions -----
  const initiateCall = async () => {
    if (!signalRConnection || signalRConnection.state !== "Connected" || isCalling) return;

    console.log("📞 Bắt đầu cuộc gọi...");
    const pc = await createPeerConnection(conversation.other_user_id!.toString());
    if (!pc) {
      console.error("Không thể tạo PeerConnection. Dừng cuộc gọi.");
      cleanupCall();
      return;
    }

    peerConnectionRef.current = pc;
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    //console.log("🔎 Local Offer SDP:\n", pc.localDescription?.sdp);

    setIsCalling(true);
    signalRConnection.invoke("SendCallOffer", conversation.other_user_id!.toString(), JSON.stringify(offer));
  };

  const answerCall = async () => {
    if (!incomingCall || !signalRConnection || signalRConnection.state !== "Connected" || isCalling) return;

    // 1. Tạo peerConnection
    const pc = new RTCPeerConnection(rtcConfig);

    // 2. Gán ontrack trước khi signaling
    pc.ontrack = (e) => {
      console.log("✅✅✅ SỰ KIỆN ONTRACK ĐÃ CHẠY! ✅✅✅");
      console.log("Stream nhận được:", e.streams[0]);
      console.log("Loại track:", e.track.kind);
      if (e.streams && e.streams[0]) {
        setRemoteStream(e.streams[0]);
      }
    };

    peerConnectionRef.current = pc;

    // 3. Lấy localStream nếu chưa có
    if (!localStreamRef.current) {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    }
    // 4. Add track NGAY SAU khi có localStream
    localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));

    // 5. Sau đó mới setRemoteDescription
    await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    peerConnectionRef.current = pc;
    setIsCalling(true);
    setIncomingCall(null);

    signalRConnection.invoke("SendCallAnswer", incomingCall.callerId, JSON.stringify(answer));
  };

  const declineCall = () => {
    if (incomingCall) {
      signalRConnection?.invoke("EndCall", incomingCall.callerId);
    }
    cleanupCall();
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

    conn.on("ReceiveMessage", (newMessageData: any) => {
      const isMessageForCurrentConversation =
        (newMessageData.sender_id === conversation.other_user_id && newMessageData.target_id === sender.id) ||
        (newMessageData.sender_id === sender.id && newMessageData.target_id === conversation.other_user_id);
      if (isMessageForCurrentConversation) {
        setMessages((prev) => [...prev, new Message(newMessageData)]);
      }
    });

    conn.onreconnected(async (connectionId) => {
      console.log(`✅ SignalR reconnected với connectionId: ${connectionId}`);
      const lastMessageId =
        messages
          .slice()
          .reverse()
          .find((m) => typeof m.id === "number")?.id ?? 0;
      console.log(`Đang đồng bộ tin nhắn từ sau ID: ${lastMessageId}`);
      try {
        const missedMessages = await callApi<Message[]>(
          `${API_ROUTES.MESSENGER.SYNC}?conversationId=${conversation.conversation_id}&lastMessageId=${lastMessageId}`,
          HTTP_METHOD_ENUM.GET
        );
        if (missedMessages && missedMessages.length > 0) {
          console.log(`Tìm thấy ${missedMessages.length} tin nhắn đã lỡ.`);
          const missedMessageInstances = missedMessages.map((m) => new Message(m));
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
    conn.on("ReceiveCallOffer", (callerId, offer) => {
      console.log("Incoming call offer from:", callerId);
      setIncomingCall({ callerId, offer: JSON.parse(offer) });
    });

    conn.on("ReceiveCallAnswer", async (answer) => {
      console.log("📞 Người gọi nhận ANSWER");
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
        console.log("🔎 Answer SDP (bên gọi):\n", peerConnectionRef.current.remoteDescription?.sdp);
      } else {
        console.warn("PeerConnection not found when receiving answer.");
      }
    });

    conn.on("ReceiveIceCandidate", (senderId: string, candidateJsonString: string) => {
      try {
        const iceCandidateData: RTCIceCandidateInit = JSON.parse(candidateJsonString);
        console.log("🧊 Nhận ICE Candidate (parse thành công):", iceCandidateData);
        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
          peerConnectionRef.current
            .addIceCandidate(new RTCIceCandidate(iceCandidateData))
            .catch((e) => console.error("Lỗi khi thêm ICE Candidate:", e));
        } else {
          console.warn("Không thể thêm ICE Candidate: PeerConnection hoặc RemoteDescription chưa sẵn sàng.");
        }
      } catch (e) {
        console.error("Lỗi khi parse ICE Candidate JSON:", e, candidateJsonString);
      }
    });

    conn.on("CallEnded", (userId: string) => {
      console.log(`Cuộc gọi với ${userId} đã kết thúc.`);
      cleanupCall();
    });

    conn.start().catch((err) => console.error("Kết nối SignalR thất bại: ", err));

    return () => {
      conn.stop();
      cleanupCall();
    };
  }, [sender.id, conversation.other_user_id, cleanupCall]);

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
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? savedMessage : msg)));
    } catch (err) {
      console.error("Gửi tin nhắn thất bại:", err);
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
      status: "Sending",
    });

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");

    performSendMessage(content, temporaryId);
  };

  // Xử lý gửi lại tin nhắn bị lỗi
  const handleRetrySend = (failedMessage: Message) => {
    if (!failedMessage.content) return;
    setMessages((prev) => prev.filter((m) => m.id !== failedMessage.id));
    const temporaryId = `temp_${Date.now()}`;
    const optimisticMessage = new Message({ ...failedMessage, id: temporaryId, status: "Sending", created_at: new Date().toISOString() });
    setMessages((prev) => [...prev, optimisticMessage]);
    performSendMessage(failedMessage.content, temporaryId);
  };

  // ----- JSX Render -----
  return (
    <>
      <div
        className="fixed bottom-4 z-40 flex w-full max-w-[320px] flex-col overflow-hidden rounded-xl border bg-card shadow-lg max-h-[500px]"
        style={style}
      >
        <div className="flex items-center justify-between gap-2 border-b bg-muted px-4 py-3">
          <div className="flex items-center gap-2">
            <Avatar src={conversation.avatar_url ?? "/avatar.png"} size="sm" />
            <div>
              <p className="text-sm font-semibold">{conversation.other_user_name}</p>
              <p className="text-xs text-muted-foreground">Đang hoạt động</p>
            </div>
          </div>
          <div className="flex items-center">
            <Button size="icon" variant="ghost" onClick={initiateCall} disabled={isCalling}>
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

        <ScrollArea className="h-[300px] space-y-2 overflow-y-auto p-4">
          <MessageList messages={messages} senderId={sender.id} onRetrySend={handleRetrySend} />
          <div ref={bottomRef} />
        </ScrollArea>

        <form onSubmit={sendMessage} className="flex gap-2 border-t bg-muted p-4">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập tin nhắn..." />
          <Button type="submit">Gửi</Button>
        </form>
      </div>

      {isCalling && <VideoCallWindow localStreamRef={localStreamRef} remoteStream={remoteStream} onEndCall={endCall} />}

      {incomingCall && (
        <IncomingCallModal callerName={conversation.other_user_name ?? "Một người dùng"} onAccept={answerCall} onDecline={declineCall} />
      )}
    </>
  );
}
