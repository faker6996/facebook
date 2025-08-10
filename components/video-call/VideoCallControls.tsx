"use client";

import React from 'react';
import { Phone, PhoneOff, Mic, MicOff, Camera, CameraOff, Monitor } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface VideoCallControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
  onToggleScreenShare?: () => void;
  variant?: 'waiting' | 'active' | 'incoming';
  onAccept?: () => void;
  onDecline?: () => void;
  acceptLabel?: string;
  declineLabel?: string;
  className?: string;
}

export const VideoCallControls: React.FC<VideoCallControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onEndCall,
  onToggleScreenShare,
  variant = 'active',
  onAccept,
  onDecline,
  acceptLabel = 'Accept',
  declineLabel = 'Decline',
  className,
}) => {
  if (variant === 'incoming') {
    return (
      <div className={cn("absolute bottom-4 sm:bottom-6 lg:bottom-10 left-1/2 transform -translate-x-1/2 w-full px-4 sm:px-6", className)}>
        <div className="flex items-center justify-center gap-12 sm:gap-16 lg:gap-20">
          {/* Decline Button */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative">
              <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-destructive/20 animate-ping"></div>
              <div className="absolute inset-1 w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-destructive/10 animate-ping" style={{ animationDelay: "0.3s" }}></div>
              <Button 
                size="icon" 
                variant="danger" 
                onClick={onDecline} 
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full hover:scale-110 transition-all duration-200 shadow-2xl border-2 border-border/30 focus:ring-4 focus:ring-destructive/50 focus:outline-none" 
                aria-label={declineLabel}
              >
                <PhoneOff className="w-6 h-6 sm:w-8 sm:h-8" />
              </Button>
            </div>
            <span className="text-foreground font-medium text-sm sm:text-base mt-1" style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}>
              {declineLabel}
            </span>
          </div>

          {/* Accept Button */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative">
              <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-success/20 animate-ping" style={{ animationDelay: "0.5s" }}></div>
              <div className="absolute inset-1 w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-success/10 animate-ping" style={{ animationDelay: "0.8s" }}></div>
              <Button
                size="icon"
                onClick={onAccept}
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-success hover:bg-success/80 text-success-foreground hover:scale-110 transition-all duration-200 shadow-2xl border-2 border-border/30 focus:ring-4 focus:ring-success/50 focus:outline-none"
                aria-label={acceptLabel}
              >
                <Phone className="w-6 h-6 sm:w-8 sm:h-8" />
              </Button>
            </div>
            <span className="text-foreground font-medium text-sm sm:text-base mt-1" style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}>
              {acceptLabel}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("absolute bottom-4 sm:bottom-6 lg:bottom-10 left-1/2 transform -translate-x-1/2 w-full px-4 sm:px-6", className)}>
      <div className="flex justify-center">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 bg-background/80 backdrop-blur-md rounded-full px-4 py-3 sm:px-6 sm:py-3 border border-border/50 shadow-2xl hover:bg-background/90 transition-all duration-300">
          {/* Audio Toggle */}
          <Button
            size="icon"
            variant={isAudioEnabled ? "ghost" : "danger"}
            onClick={onToggleAudio}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:scale-110 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:outline-none"
            aria-label={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
            aria-pressed={isAudioEnabled}
          >
            {isAudioEnabled ? <Mic className="w-4 h-4 sm:w-6 sm:h-6" /> : <MicOff className="w-4 h-4 sm:w-6 sm:h-6" />}
          </Button>

          {/* Video Toggle */}
          <Button
            size="icon"
            variant={isVideoEnabled ? "ghost" : "danger"}
            onClick={onToggleVideo}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:scale-110 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:outline-none"
            aria-label={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
            aria-pressed={isVideoEnabled}
          >
            {isVideoEnabled ? <Camera className="w-4 h-4 sm:w-6 sm:h-6" /> : <CameraOff className="w-4 h-4 sm:w-6 sm:h-6" />}
          </Button>

          {/* Screen Share (optional) */}
          {onToggleScreenShare && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleScreenShare}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:scale-110 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:outline-none"
              aria-label="Share screen"
            >
              <Monitor className="w-4 h-4 sm:w-6 sm:h-6" />
            </Button>
          )}

          {/* End Call */}
          <Button
            size="icon"
            variant="danger"
            onClick={onEndCall}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full hover:scale-110 transition-all duration-200 shadow-lg border-2 border-border/20 focus:ring-4 focus:ring-destructive/50 focus:outline-none"
            aria-label="End call"
          >
            <PhoneOff className="w-5 h-5 sm:w-7 sm:h-7" />
          </Button>
        </div>
      </div>
    </div>
  );
};