"use client";

import React, { useEffect, useRef } from "react";
import { PhoneOff } from "lucide-react";
import Button from "../ui/Button";

interface Props {
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  remoteStream: MediaStream | null;
  onEndCall: () => void;
}

export default function VideoCallWindow({ localStreamRef, remoteStream, onEndCall }: Props) {
  // LOG 1: Kiểm tra mỗi lần component re-render và giá trị prop nhận được
  console.log("[VideoCallWindow] Component re-render. Giá trị prop remoteStream:", remoteStream);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  /* ----- Gán stream local ----- */
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.muted = true; // Rất quan trọng để tránh tiếng vọng
      localVideoRef.current.play().catch((err) => console.warn("Local play()", err.name, err.message));
    }
  }, [localStreamRef]);

  /* ----- Gán stream remote ----- */
  useEffect(() => {
    // LOG 2: Kiểm tra xem useEffect có được kích hoạt khi prop thay đổi không
    console.log("[useEffect remote] Chạy với dependency remoteStream:", remoteStream);

    if (remoteVideoRef.current && remoteStream) {
      // LOG 3: Xác nhận cả thẻ video và stream đều tồn tại trước khi gán
      console.log("[useEffect remote] Bắt đầu gán stream vào thẻ video.", {
        videoElement: remoteVideoRef.current,
        streamObject: remoteStream,
      });

      remoteVideoRef.current.srcObject = remoteStream;

      const vid = remoteVideoRef.current;
      const handler = () =>
        vid.play().catch((err) => {
          // LOG 4: Bắt lỗi nếu trình duyệt không cho phép tự động play video
          console.error("🔴 LỖI KHI PLAY VIDEO REMOTE:", err.name, err.message);
        });

      if (vid.readyState >= 4) {
        // readyState 4 (HAVE_ENOUGH_DATA) là tốt nhất
        handler();
      } else {
        vid.addEventListener("canplaythrough", handler, { once: true });
      }
    } else {
      // LOG 5: Ghi lại lý do tại sao không gán stream
      console.warn("[useEffect remote] Bỏ qua việc gán stream vì video element hoặc stream không hợp lệ.", {
        hasVideoEl: !!remoteVideoRef.current,
        hasStream: !!remoteStream,
      });
    }
  }, [remoteStream]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative h-[90vh] w-[90vw] max-w-4xl rounded-lg bg-gray-900 p-4">
        <video ref={remoteVideoRef} className="h-full w-full rounded-md object-cover bg-black" playsInline autoPlay />
        <video ref={localVideoRef} className="absolute right-6 top-6 h-1/4 w-1/4 rounded-md border-2 border-white bg-black" playsInline autoPlay />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <Button size="icon" variant="danger" className="h-16 w-16 rounded-full" onClick={onEndCall}>
            <PhoneOff className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
}
