"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { X, Video, VideoOff, Mic, MicOff, PhoneOff, Phone, Maximize, Minimize, Wifi, WifiOff, Signal } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

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
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'disconnected';
  networkStats?: {
    rtt?: number;
    bandwidth?: number;
    packetsLost?: number;
  };
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
  connectionQuality = 'good',
  networkStats,
}: VideoCallProps) {
  const t = useTranslations("VideoCall");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);

  const [avatarColors, setAvatarColors] = useState({ primary: "#6366f1", secondary: "#8b5cf6" });
  const [backgroundPattern, setBackgroundPattern] = useState('');

  // Enhanced fallback color generation with pattern
  const generateFallbackColor = useCallback(() => {
    const name = callerName || "Unknown";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      { primary: "#ef4444", secondary: "#f97316" },
      { primary: "#f97316", secondary: "#eab308" },
      { primary: "#22c55e", secondary: "#10b981" },
      { primary: "#06b6d4", secondary: "#3b82f6" },
      { primary: "#6366f1", secondary: "#8b5cf6" },
      { primary: "#a855f7", secondary: "#ec4899" },
    ];
    const index = Math.abs(hash) % colors.length;
    setAvatarColors(colors[index]);
    
    // Generate dynamic background pattern
    const patterns = [
      'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
      'radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 60%)',
      'radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 40%)',
    ];
    setBackgroundPattern(patterns[index % patterns.length]);
  }, [callerName]);

  // Enhanced color extraction with pattern generation
  const extractAvatarColors = useCallback((imageSrc: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx?.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) return;
        
        const data = imageData.data;
        const colorMap: { [key: string]: number } = {};
        
        // Sample pixels and find dominant colors
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const alpha = data[i + 3];
          
          if (alpha > 128) {
            const color = `${r},${g},${b}`;
            colorMap[color] = (colorMap[color] || 0) + 1;
          }
        }
        
        const sortedColors = Object.entries(colorMap)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 2);
          
        if (sortedColors.length >= 2) {
          const [r1, g1, b1] = sortedColors[0][0].split(',').map(Number);
          const [r2, g2, b2] = sortedColors[1][0].split(',').map(Number);
          
          setAvatarColors({
            primary: `rgb(${r1}, ${g1}, ${b1})`,
            secondary: `rgb(${r2}, ${g2}, ${b2})`
          });
          
          // Generate dynamic pattern based on extracted colors
          const brightness = (r1 * 299 + g1 * 587 + b1 * 114) / 1000;
          const opacity = brightness > 128 ? '0.08' : '0.12';
          setBackgroundPattern(
            `radial-gradient(circle at 50% 50%, rgba(255,255,255,${opacity}) 0%, transparent 50%)`
          );
        }
      } catch (error) {
        console.warn('Could not extract colors from avatar:', error);
        generateFallbackColor();
      }
    };
    
    img.onerror = () => {
      console.warn('Could not load avatar image');
      generateFallbackColor();
    };
    
    img.src = imageSrc;
  }, []);

  useEffect(() => {
    if (callerAvatar) {
      extractAvatarColors(callerAvatar);
    } else {
      generateFallbackColor();
    }
  }, [callerAvatar, callerName, extractAvatarColors, generateFallbackColor]);

  // Animation entrance effect
  useEffect(() => {
    if (isActive) {
      setIsAnimatingIn(true);
      const timer = setTimeout(() => setIsAnimatingIn(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

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

  useEffect(() => {
    if (isActive && !isIncoming && !isOutgoing) {
      const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isActive, isIncoming, isOutgoing]);

  useEffect(() => {
    if (showControls) {
      if (controlsTimeout) clearTimeout(controlsTimeout);
      const timeout = setTimeout(() => {
        if (isActive && !isIncoming && !isOutgoing) {
          setShowControls(false);
        }
      }, 4000);
      setControlsTimeout(timeout);
    }
    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout);
    };
  }, [showControls, isActive, isIncoming, isOutgoing]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = useCallback(() => {
    if (isActive && !isIncoming && !isOutgoing) {
      setShowControls(true);
    }
  }, [isActive, isIncoming, isOutgoing]);

  // Connection quality indicator
  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent':
        return <Signal className="w-4 h-4 text-success" />;
      case 'good':
        return <Wifi className="w-4 h-4 text-success" />;
      case 'poor':
        return <Wifi className="w-4 h-4 text-warning" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-destructive" />;
      default:
        return <Wifi className="w-4 h-4 text-success" />;
    }
  };

  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'excellent':
      case 'good':
        return 'text-success';
      case 'poor':
        return 'text-warning';
      case 'disconnected':
        return 'text-destructive';
      default:
        return 'text-success';
    }
  };

  if (!isActive) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 flex flex-col transition-all duration-500 ease-out",
        isFullscreen ? "z-[9999]" : "z-[9998]",
        isAnimatingIn ? "scale-105 opacity-0" : "scale-100 opacity-100"
      )}
      onMouseMove={handleMouseMove}
      style={{
        zIndex: 9999,
        background: `linear-gradient(135deg, ${avatarColors.primary} 0%, ${avatarColors.secondary} 100%)`,
        backgroundImage: backgroundPattern,
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 8s ease infinite',
      }}
    >
      {/* Video Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-white/8 blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
        
        {/* Remote Video or Waiting UI */}
        <div className="absolute inset-0 backdrop-blur-sm">
          {remoteStream ? (
            <div className="relative w-full h-full">
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover transition-all duration-300 hover:scale-105" 
                aria-label={`${callerName || t("unknownCaller")} video stream`}
              />
              {/* Connection quality overlay */}
              <div className="absolute top-4 left-4">
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/20 backdrop-blur-md border border-border/20 cursor-pointer transition-all duration-200 hover:bg-background/30"
                  onClick={() => setShowNetworkInfo(!showNetworkInfo)}
                >
                  {getConnectionIcon()}
                  <span className={cn("text-xs font-medium", getConnectionColor())}>
                    {connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}
                  </span>
                </div>
                {showNetworkInfo && networkStats && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-background/80 backdrop-blur-md rounded-lg border border-border/20 text-xs space-y-1 min-w-[150px]">
                    {networkStats.rtt && <div>RTT: {networkStats.rtt}ms</div>}
                    {networkStats.bandwidth && <div>Bandwidth: {Math.round(networkStats.bandwidth / 1024)}kb/s</div>}
                    {networkStats.packetsLost && <div>Lost: {networkStats.packetsLost}%</div>}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
              {/* Enhanced Waiting UI with Responsive Design */}
              <div className="text-center z-10 relative flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="relative mb-6 sm:mb-8 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 flex items-center justify-center">
                  {/* Multi-layer animation rings */}
                  <div className="absolute inset-0 rounded-full bg-white/20 animate-ping"></div>
                  <div className="absolute inset-1 rounded-full bg-white/15 animate-ping" style={{ animationDelay: "0.5s" }}></div>
                  <div className="absolute inset-2 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: "1s" }}></div>
                  <div className="absolute inset-3 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: "1.5s" }}></div>
                  
                  {/* Avatar container with enhanced styling */}
                  <div
                    className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground shadow-2xl border-4 border-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                    style={{ 
                      background: `linear-gradient(135deg, ${avatarColors.secondary} 0%, ${avatarColors.primary} 100%)`,
                      boxShadow: `0 0 50px rgba(255,255,255,0.3), inset 0 0 20px rgba(255,255,255,0.1)`
                    }}
                  >
                    {callerAvatar ? (
                      <img 
                        src={callerAvatar} 
                        alt={`${callerName || t("unknownCaller")} avatar`} 
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                        loading="lazy"
                      />
                    ) : null}
                    <span className={callerAvatar ? 'hidden' : ''} aria-hidden="true">
                      {callerName ? callerName.charAt(0).toUpperCase() : "?"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 px-4 sm:px-6">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground tracking-wide transition-all duration-300" style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.4)" }}>
                    {callerName || t("unknownCaller")}
                  </h2>
                  {isIncoming && <p className="text-primary-foreground/90 text-lg sm:text-xl font-medium drop-shadow-lg animate-pulse">{t("incomingCall")}</p>}
                  {isOutgoing && <p className="text-primary-foreground/90 text-lg sm:text-xl font-medium drop-shadow-lg">{t("outgoingCall")}</p>}
                  {!isIncoming && !isOutgoing && (
                    <p className="text-primary-foreground/90 text-lg sm:text-xl font-medium drop-shadow-lg">{formatDuration(callDuration)}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Local Video with Responsive Design */}
        {localStream && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-24 h-20 sm:w-32 sm:h-24 lg:w-40 lg:h-32 bg-black rounded-lg overflow-hidden border-2 border-white/30 shadow-2xl transition-all duration-300 hover:scale-105 hover:border-white/50 group">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300" 
              aria-label="Your video stream"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        {/* Enhanced Call Info with Mobile Responsiveness */}
        {remoteStream && (
          <div className={cn("absolute top-2 left-2 sm:top-4 sm:left-4 transition-all duration-300 transform", showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2")}>
            <div className="bg-background/80 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-border/50 shadow-lg hover:bg-background/90 transition-all duration-200">
              <h3 className="text-sm sm:text-lg font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">{callerName || t("unknownCaller")}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">{formatDuration(callDuration)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Controls with Better Responsiveness */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-10 left-1/2 transform -translate-x-1/2 w-full px-4 sm:px-6">
        <div className={cn("transition-all duration-500 ease-out transform", !remoteStream || showControls ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95")}>
          {/* Enhanced Incoming Call Controls */}
          {isIncoming && (
            <div className="flex items-center justify-center gap-12 sm:gap-16 lg:gap-20">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                  <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-destructive/20 animate-ping"></div>
                  <div className="absolute inset-1 w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-destructive/10 animate-ping" style={{ animationDelay: "0.3s" }}></div>
                  <Button 
                    size="icon" 
                    variant="danger" 
                    onClick={onDecline} 
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full hover:scale-110 transition-all duration-200 shadow-2xl border-2 border-white/30 focus:ring-4 focus:ring-destructive/50 focus:outline-none" 
                    aria-label={t("declineCall")}
                    role="button"
                    tabIndex={0}
                  >
                    <PhoneOff className="w-6 h-6 sm:w-8 sm:h-8" />
                  </Button>
                </div>
                <span className="text-primary-foreground/90 font-medium text-sm sm:text-base mt-1">{t("decline")}</span>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative">
                  <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-success/20 animate-ping" style={{ animationDelay: "0.5s" }}></div>
                  <div className="absolute inset-1 w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-success/10 animate-ping" style={{ animationDelay: "0.8s" }}></div>
                  <Button
                    size="icon"
                    onClick={onAccept}
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-success hover:bg-success/80 text-success-foreground hover:scale-110 transition-all duration-200 shadow-2xl border-2 border-white/30 focus:ring-4 focus:ring-success/50 focus:outline-none"
                    aria-label={t("acceptCall")}
                    role="button"
                    tabIndex={0}
                  >
                    <Phone className="w-6 h-6 sm:w-8 sm:h-8" />
                  </Button>
                </div>
                <span className="text-primary-foreground/90 font-medium text-sm sm:text-base mt-1">{t("accept")}</span>
              </div>
            </div>
          )}

          {/* Enhanced Active Call Controls */}
          {!isIncoming && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 bg-background/80 backdrop-blur-md rounded-full px-4 py-3 sm:px-6 sm:py-3 border border-border/50 shadow-2xl hover:bg-background/90 transition-all duration-300">
                <Button
                  size="icon"
                  variant={isVideoEnabled ? "ghost" : "danger"}
                  onClick={onToggleVideo}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:scale-110 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  aria-label={t("toggleVideo")}
                  aria-pressed={isVideoEnabled}
                  role="button"
                  tabIndex={0}
                >
                  {isVideoEnabled ? <Video className="w-4 h-4 sm:w-6 sm:h-6" aria-hidden="true" /> : <VideoOff className="w-4 h-4 sm:w-6 sm:h-6" aria-hidden="true" />}
                </Button>
                <Button
                  size="icon"
                  variant={isAudioEnabled ? "ghost" : "danger"}
                  onClick={onToggleAudio}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:scale-110 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  aria-label={t("toggleAudio")}
                  aria-pressed={isAudioEnabled}
                  role="button"
                  tabIndex={0}
                >
                  {isAudioEnabled ? <Mic className="w-4 h-4 sm:w-6 sm:h-6" aria-hidden="true" /> : <MicOff className="w-4 h-4 sm:w-6 sm:h-6" aria-hidden="true" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onToggleFullscreen}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:scale-110 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:outline-none"
                  aria-label={isFullscreen ? t("minimize") : t("toggleFullscreen")}
                  aria-pressed={isFullscreen}
                  role="button"
                  tabIndex={0}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4 sm:w-6 sm:h-6" aria-hidden="true" /> : <Maximize className="w-4 h-4 sm:w-6 sm:h-6" aria-hidden="true" />}
                </Button>
                <Button 
                  size="icon" 
                  variant="danger" 
                  onClick={onEnd} 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full hover:scale-110 transition-all duration-200 shadow-lg border-2 border-white/20 focus:ring-4 focus:ring-destructive/50 focus:outline-none" 
                  aria-label={t("endCall")}
                  role="button"
                  tabIndex={0}
                >
                  <PhoneOff className="w-5 h-5 sm:w-7 sm:h-7" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
