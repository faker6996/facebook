"use client";

import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Button from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { 
  VideoCallIcon, 
  VideoOffIcon, 
  AudioIcon, 
  AudioOffIcon, 
  PhoneOffIcon,
  FullscreenIcon,
  MinimizeIcon
} from '@/components/icons/VideoCallIcons';

interface VideoCallProps {
  isActive: boolean;
  isIncoming?: boolean;
  isOutgoing?: boolean;
  callerName: string;
  callerAvatar?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  onEnd?: () => void;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  onToggleFullscreen?: () => void;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  isFullscreen?: boolean;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
}

export default function VideoCall({
  isActive,
  isIncoming = false,
  isOutgoing = false,
  callerName,
  callerAvatar,
  onAccept,
  onDecline,
  onEnd,
  onToggleVideo,
  onToggleAudio,
  onToggleFullscreen,
  isVideoEnabled = true,
  isAudioEnabled = true,
  isFullscreen = false,
  localStream,
  remoteStream,
}: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Setup video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Call duration timer
  useEffect(() => {
    if (isActive && !isIncoming && !isOutgoing) {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActive, isIncoming, isOutgoing]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls) {
      if (controlsTimeout) clearTimeout(controlsTimeout);
      const timeout = setTimeout(() => {
        if (isActive && !isIncoming && !isOutgoing) {
          setShowControls(false);
        }
      }, 3000);
      setControlsTimeout(timeout);
    }
    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout);
    };
  }, [showControls, isActive, isIncoming, isOutgoing]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    if (isActive && !isIncoming && !isOutgoing) {
      setShowControls(true);
    }
  };

  if (!isActive) return null;

  console.log('📺 VideoCall rendering with props:', {
    isActive,
    isIncoming,
    isOutgoing,
    callerName,
    callerAvatar,
    hasLocalStream: !!localStream,
    hasRemoteStream: !!remoteStream
  });

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black flex flex-col",
        isFullscreen ? "z-[9999]" : "z-[9998]"
      )}
      onMouseMove={handleMouseMove}
      style={{ zIndex: 9999 }}
    >
      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <div className="absolute inset-0">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)',
                minHeight: '100vh'
              }}
            >
              <div className="text-center text-white">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-300 flex items-center justify-center text-4xl font-bold text-gray-600">
                  {callerName ? callerName.charAt(0).toUpperCase() : '?'}
                </div>
                <h2 className="text-2xl font-semibold mb-2">{callerName}</h2>
                {isIncoming && (
                  <p className="text-white/80 text-lg">Đang gọi bạn...</p>
                )}
                {isOutgoing && (
                  <p className="text-white/80 text-lg">Đang kết nối...</p>
                )}
                {!isIncoming && !isOutgoing && (
                  <p className="text-white/80 text-lg">{formatDuration(callDuration)}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Local Video */}
        {localStream && (
          <div className="absolute top-4 right-4 w-32 h-24 bg-black rounded-lg overflow-hidden border-2 border-white/20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Call Info */}
        <div 
          className={cn(
            "absolute top-4 left-4 text-white transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <h3 className="text-lg font-semibold">{callerName}</h3>
          {!isIncoming && !isOutgoing && (
            <p className="text-sm text-white/80">{formatDuration(callDuration)}</p>
          )}
          {isIncoming && (
            <p className="text-sm text-white/80">Cuộc gọi đến</p>
          )}
          {isOutgoing && (
            <p className="text-sm text-white/80">Đang gọi...</p>
          )}
        </div>

        {/* Close Button */}
        <div 
          className={cn(
            "absolute top-4 right-4 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {localStream && <div className="mb-2" />}
          <Button
            size="icon"
            variant="ghost"
            onClick={onEnd}
            className="w-10 h-10 bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div 
        className={cn(
          "absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Incoming Call Controls */}
        {isIncoming && (
          <div className="flex items-center gap-6">
            <Button
              size="icon"
              variant="danger"
              onClick={onDecline}
              className="w-16 h-16 rounded-full"
            >
              <PhoneOffIcon className="w-8 h-8" />
            </Button>
            <Button
              size="icon"
              variant="success"
              onClick={onAccept}
              className="w-16 h-16 rounded-full"
            >
              <VideoCallIcon className="w-8 h-8" />
            </Button>
          </div>
        )}

        {/* Active Call Controls */}
        {!isIncoming && (
          <div className="flex items-center gap-4 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
            <Button
              size="icon"
              variant={isVideoEnabled ? "ghost" : "danger"}
              onClick={onToggleVideo}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              {isVideoEnabled ? (
                <VideoCallIcon className="w-6 h-6" />
              ) : (
                <VideoOffIcon className="w-6 h-6" />
              )}
            </Button>

            <Button
              size="icon"
              variant={isAudioEnabled ? "ghost" : "danger"}
              onClick={onToggleAudio}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              {isAudioEnabled ? (
                <AudioIcon className="w-6 h-6" />
              ) : (
                <AudioOffIcon className="w-6 h-6" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleFullscreen}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              {isFullscreen ? (
                <MinimizeIcon className="w-6 h-6" />
              ) : (
                <FullscreenIcon className="w-6 h-6" />
              )}
            </Button>

            <Button
              size="icon"
              variant="danger"
              onClick={onEnd}
              className="w-12 h-12 rounded-full"
            >
              <PhoneOffIcon className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}