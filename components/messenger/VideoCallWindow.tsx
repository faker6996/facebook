"use client";

import { PhoneOff } from "lucide-react";
import Button from "../ui/Button";
import React from "react";

interface Props {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEndCall: () => void;
}

export default function VideoCallWindow({ localStream, remoteStream, onEndCall }: Props) {
  const localVideoRef = React.useRef<HTMLVideoElement>(null);
  const remoteVideoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  React.useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative h-[90vh] w-[90vw] max-w-4xl rounded-lg bg-gray-900 p-4">
        {/* Video của người đối diện */}
        <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full rounded-md object-cover" />
        {/* Video của bạn */}
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute right-6 top-6 h-1/4 w-1/4 rounded-md border-2 border-white" />
        {/* Nút kết thúc */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2">
          <Button size="icon" variant="danger" className="h-16 w-16 rounded-full" onClick={onEndCall}>
            <PhoneOff className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
}
