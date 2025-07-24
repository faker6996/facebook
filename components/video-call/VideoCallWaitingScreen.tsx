"use client";

import React from 'react';
import { Users, CameraOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

interface VideoCallWaitingScreenProps {
  title: string;
  subtitle?: string;
  isConnecting?: boolean;
  callDuration?: number;
  avatar?: string;
  fallbackIcon?: React.ReactNode;
  localStream?: MediaStream;
  isLocalVideoEnabled?: boolean;
  currentUserName?: string;
  className?: string;
}

export const VideoCallWaitingScreen: React.FC<VideoCallWaitingScreenProps> = ({
  title,
  subtitle,
  isConnecting = false,
  callDuration = 0,
  avatar,
  fallbackIcon,
  localStream,
  isLocalVideoEnabled = true,
  currentUserName = 'You',
  className,
}) => {
  const t = useTranslations('VideoCall');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("w-full h-full flex items-center justify-center relative overflow-hidden", className)}>
      {/* Background Effects - Same as VideoCall */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-foreground/10 blur-3xl animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-foreground/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-foreground/8 blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
      <div className="text-center z-10 relative flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="relative mb-6 sm:mb-8 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 flex items-center justify-center">
          {/* Multi-layer animation rings */}
          <div className="absolute inset-0 rounded-full bg-foreground/20 animate-ping"></div>
          <div className="absolute inset-1 rounded-full bg-foreground/15 animate-ping" style={{ animationDelay: "0.5s" }}></div>
          <div className="absolute inset-2 rounded-full bg-foreground/30 animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute inset-3 rounded-full bg-foreground/10 animate-pulse" style={{ animationDelay: "1.5s" }}></div>
          
          {/* Avatar container */}
          <div
            className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground shadow-2xl border-4 border-border/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary to-secondary"
            style={{ 
              boxShadow: `0 0 50px rgba(255,255,255,0.3), inset 0 0 20px rgba(255,255,255,0.1)`
            }}
          >
            {avatar ? (
              <img 
                src={avatar} 
                alt={`${title} avatar`} 
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
                loading="lazy"
              />
            ) : null}
            <span className={avatar ? 'hidden' : ''} aria-hidden="true">
              {fallbackIcon || (title ? title.charAt(0).toUpperCase() : "?")}
            </span>
          </div>
        </div>

        <div className="space-y-2 sm:space-y-3 px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-wide transition-all duration-300" style={{ textShadow: "2px 2px 12px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.6)" }}>
            {title}
          </h2>
          {isConnecting && (
            <p className="text-foreground/95 text-lg sm:text-xl font-medium animate-pulse" style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}>
              {t('connecting')}
            </p>
          )}
          {!isConnecting && subtitle && (
            <p className="text-foreground/95 text-lg sm:text-xl font-medium" style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}>
              {subtitle}
            </p>
          )}
          {!isConnecting && !subtitle && callDuration > 0 && (
            <p className="text-foreground/95 text-lg sm:text-xl font-medium" style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}>
              {formatDuration(callDuration)}
            </p>
          )}
        </div>
      </div>

      {/* Local Video Preview */}
      {localStream && isLocalVideoEnabled && (
        <div className="absolute bottom-20 right-2 sm:bottom-24 sm:right-4 w-24 h-20 sm:w-32 sm:h-24 lg:w-40 lg:h-32 bg-muted rounded-lg overflow-hidden border-2 border-primary/50 shadow-2xl transition-all duration-300 hover:scale-105 hover:border-primary group">
          <video 
            ref={(ref) => {
              if (ref && localStream) {
                ref.srcObject = localStream;
              }
            }}
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300" 
            aria-label="Your video stream"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-1 left-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-success-foreground rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
      
      {/* Audio-only indicator when video disabled */}
      {localStream && !isLocalVideoEnabled && (
        <div className="absolute bottom-20 right-2 sm:bottom-24 sm:right-4 w-24 h-20 sm:w-32 sm:h-24 lg:w-40 lg:h-32 bg-muted rounded-lg overflow-hidden border-2 border-muted-foreground/30 shadow-2xl transition-all duration-300 hover:scale-105 hover:border-muted-foreground/50 group flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 bg-muted-foreground/20 rounded-full flex items-center justify-center mb-1">
              <CameraOff className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground">{currentUserName}</div>
          </div>
        </div>
      )}
    </div>
  );
};