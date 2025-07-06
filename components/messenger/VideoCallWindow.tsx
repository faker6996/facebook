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
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  /* ----- Gán stream local ----- */
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.muted = true;
      localVideoRef.current.play().catch((err) => console.warn("Local play()", err.name, err.message));
    }
  }, [localStreamRef.current]);

  /* ----- Gán stream remote (với hàm dọn dẹp) ----- */
  useEffect(() => {
    const videoEl = remoteVideoRef.current;

    if (videoEl && remoteStream) {
      console.log("✅ [useEffect remote] Bắt đầu. Gán stream và play.");

      videoEl.srcObject = remoteStream;
      videoEl.muted = true;

      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("🔴 Lỗi khi play video remote:", error);
        });
      }
    }

    // HÀM DỌN DẸP: Sẽ chạy trước khi useEffect được gọi lại, hoặc khi component unmount.
    return () => {
      if (videoEl) {
        console.log("🧹 [useEffect remote] Dọn dẹp: Dừng video và xóa stream.");
        videoEl.pause();
        videoEl.srcObject = null;
      }
    };
  }, [remoteStream]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative h-[90vh] w-[90vw] max-w-4xl rounded-lg bg-gray-900 p-4">
        {/* Thẻ video không cần thay đổi */}
        <video ref={remoteVideoRef} className="h-full w-full rounded-md object-cover bg-black" playsInline autoPlay muted />
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
