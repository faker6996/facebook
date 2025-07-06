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

// ===================== TURN / STUN =====================
// Các biến môi trường phải được xuất hiện trong `.env.local` với tiền tố NEXT_PUBLIC_
const TURN_HOST = process.env.NEXT_PUBLIC_TURN_HOST!; // e.g. turn.cheatersever.com
const TURN_PORT = process.env.NEXT_PUBLIC_TURN_PORT || "3478";
const TURN_PORT_TLS = process.env.NEXT_PUBLIC_TURN_PORT_TLS || "5349";

async function fetchIceServers(): Promise<RTCIceServer[]> {
  // LOG 1: Báo hiệu bắt đầu
  console.log("📡 Bắt đầu lấy thông tin ICE servers...");

  try {
    const response = await fetch("/api/turn-cred", {
      cache: "no-store",
    });

    // LOG 2: Kiểm tra xem API có trả về lỗi không (ví dụ 404, 500)
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const credentials = await response.json();

    // LOG 3: In ra credentials nhận được để kiểm tra
    console.log("✅ Lấy được credentials từ API:", credentials);

    const servers = [
      {
        urls: `stun:${TURN_HOST}:${TURN_PORT}`,
      },
      {
        urls: `turn:${TURN_HOST}:${TURN_PORT}?transport=udp`,
        username: credentials.username,
        credential: credentials.password,
      },
      {
        urls: `turn:${TURN_HOST}:${TURN_PORT}?transport=tcp`,
        username: credentials.username,
        credential: credentials.password,
      },
      {
        urls: `turns:${TURN_HOST}:${TURN_PORT_TLS}?transport=tcp`,
        username: credentials.username,
        credential: credentials.password,
      },
    ];

    // LOG 4: In ra cấu hình cuối cùng trước khi trả về
    console.log("✅ Cấu hình ICE servers hoàn chỉnh:", servers);

    return servers;
  } catch (e) {
    // LOG 5: Bắt bất kỳ lỗi nào khác trong quá trình
    console.error("🚫 LỖI NGHIÊM TRỌNG KHI FETCH ICE SERVERS:", e);
    throw e; // Ném lỗi ra ngoài để hàm createPeerConnection biết và dừng lại
  }
}

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

  // Cache ICE servers cho 1 phiên trình duyệt
  const iceServersRef = useRef<RTCIceServer[] | null>(null);

  // ----- Helper Functions for Video Call -----
  const cleanupCall = useCallback(() => {
    console.log("🧹 Dọn dẹp cuộc gọi...");
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getSenders().forEach((s) => {
        s.track?.stop();
      });
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    setRemoteStream(null);
    setIsCalling(false);
    setIncomingCall(null);
  }, []);

  /* ================== Factory ================== */
  const createPeerConnection = async (targetUserId: string): Promise<RTCPeerConnection | null> => {
    console.log(`🌀 Tạo PeerConnection cho target: ${targetUserId}`);

    // Lấy/caching ICE servers
    if (!iceServersRef.current) {
      try {
        iceServersRef.current = await fetchIceServers();
      } catch (e) {
        console.error("🚫 Không lấy được ICE servers", e);
        return null;
      }
    }

    const pc = new RTCPeerConnection({
      iceServers: iceServersRef.current,
      iceTransportPolicy: "all", // cho phép trực tiếp hoặc relay
    });

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
      if (e.streams && e.streams[0]) {
        setRemoteStream(e.streams[0]);
      }
    };

    try {
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

    setIsCalling(true);
    signalRConnection.invoke("SendCallOffer", conversation.other_user_id!.toString(), JSON.stringify(offer));
  };

  const answerCall = async () => {
    if (!incomingCall || !signalRConnection || signalRConnection.state !== "Connected" || isCalling) return;

    const pc = await createPeerConnection(incomingCall.callerId);
    if (!pc) return;

    peerConnectionRef.current = pc;

    await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

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
        if (isMounted) setMessages(response?.map((m) => new Message(m)) ?? []);
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
      .withUrl(`${process.env.NEXT_PUBLIC_CHAT_SERVER_URL}/chathub`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();
    setSignalRConnection(conn);

    conn.on("ReceiveMessage", (newMsg: any) => {
      const isForCurrent =
        (newMsg.sender_id === conversation.other_user_id && newMsg.target_id === sender.id) ||
        (newMsg.sender_id === sender.id && newMsg.target_id === conversation.other_user_id);
      if (isForCurrent) {
        setMessages((prev) => [...prev, new Message(newMsg)]);
      }
    });

    conn.onreconnected(async (connectionId) => {
      console.log(`✅ SignalR reconnected: ${connectionId}`);
      const lastId =
        messages
          .slice()
          .reverse()
          .find((m) => typeof m.id === "number")?.id ?? 0;
      try {
        const missed = await callApi<Message[]>(
          `${API_ROUTES.MESSENGER.SYNC}?conversationId=${conversation.conversation_id}&lastMessageId=${lastId}`,
          HTTP_METHOD_ENUM.GET
        );
        if (missed?.length) {
          const inst = missed.map((m) => new Message(m));
          setMessages((prev) => [...prev, ...inst].sort((a, b) => new Date(a.created_at ?? "").getTime() - new Date(b.created_at ?? "").getTime()));
        }
      } catch (err) {
        console.error("Sync fail:", err);
      }
    });

    // Video call events
    conn.on("ReceiveCallOffer", (callerId, offer) => {
      setIncomingCall({ callerId, offer: JSON.parse(offer) });
    });

    conn.on("ReceiveCallAnswer", async (answer) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer)));
      }
    });

    conn.on("ReceiveIceCandidate", (senderId: string, cand: string) => {
      try {
        const data: RTCIceCandidateInit = JSON.parse(cand);
        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
          peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data));
        }
      } catch (err) {
        console.error("ICE parse error", err);
      }
    });

    conn.on("CallEnded", () => cleanupCall());

    conn.start().catch((err) => console.error("SignalR connect fail", err));

    return () => {
      conn.stop();
      cleanupCall();
    };
  }, [sender.id, conversation.other_user_id, cleanupCall]);

  // Cuộn xuống cuối
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Gửi tin nhắn
  const performSendMessage = async (content: string, tempId: string) => {
    const body: SendMessageRequest = {
      sender_id: sender.id!,
      content,
      conversation_id: conversation.conversation_id!,
      message_type: MESSAGE_TYPE.PRIVATE,
      target_id: conversation.other_user_id,
    };

    try {
      const res = await callApi<Message>(API_ROUTES.CHAT_SERVER.SENT_MESSAGE, HTTP_METHOD_ENUM.POST, body);
      const saved = new Message(res);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
    } catch (err) {
      console.error("Send message error:", err);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? new Message({ ...m, status: "Failed" }) : m)));
    }
  };

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !sender.id) return;

    const tempId = `temp_${Date.now()}`;
    const content = input.trim();
    const optimistic = new Message({
      id: tempId,
      sender_id: sender.id,
      target_id: conversation.other_user_id,
      content,
      message_type: "text",
      created_at: new Date().toISOString(),
      status: "Sending",
    });

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    performSendMessage(content, tempId);
  };

  const handleRetrySend = (failed: Message) => {
    if (!failed.content) return;
    setMessages((prev) => prev.filter((m) => m.id !== failed.id));
    const tempId = `temp_${Date.now()}`;
    const optimistic = new Message({
      ...failed,
      id: tempId,
      status: "Sending",
      created_at: new Date().toISOString(),
    });
    setMessages((prev) => [...prev, optimistic]);
    performSendMessage(failed.content, tempId);
  };

  // ----- JSX Render -----
  return (
    <>
      <div
        className="fixed bottom-4 z-40 flex w-full max-w-[320px] max-h-[500px] flex-col overflow-hidden rounded-xl border bg-card shadow-lg"
        style={style}
      >
        {/* Header */}
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

        {/* Message list */}
        <ScrollArea className="h-[300px] space-y-2 overflow-y-auto p-4">
          <MessageList messages={messages} senderId={sender.id} onRetrySend={handleRetrySend} />
          <div ref={bottomRef} />
        </ScrollArea>

        {/* Input */}
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
