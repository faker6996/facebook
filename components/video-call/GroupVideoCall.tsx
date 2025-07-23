"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Camera, CameraOff, Monitor, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { GroupCall, CallParticipant } from '@/lib/models/group-call';
import { cn } from '@/lib/utils/cn';

interface GroupVideoCallProps {
  call: GroupCall;
  currentUserId: number;
  localStream?: MediaStream;
  remoteStreams: Map<number, MediaStream>;
  isLocalAudioEnabled: boolean;
  isLocalVideoEnabled: boolean;
  connectionStates: Map<number, RTCPeerConnectionState>;
  callState?: { isConnecting?: boolean }; // Add callState prop
  onEndCall: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare?: () => void;
  className?: string;
}

interface VideoGridProps {
  participants: CallParticipant[];
  currentUserId: number;
  localStream?: MediaStream;
  remoteStreams: Map<number, MediaStream>;
  connectionStates: Map<number, RTCPeerConnectionState>;
}

// Component for individual video stream
const VideoStreamComponent: React.FC<{
  participant: CallParticipant;
  stream?: MediaStream;
  connectionState?: RTCPeerConnectionState;
  isLocal?: boolean;
  isCurrentUser?: boolean;
}> = ({ participant, stream, connectionState, isLocal = false, isCurrentUser = false }) => {
  const t = useTranslations('GroupCall');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().then(() => {
        setIsVideoPlaying(true);
      }).catch(console.error);
    }
  }, [stream]);

  const showVideo = stream && participant.is_video_enabled && isVideoPlaying;
  const showConnectionIssue = connectionState === 'failed' || connectionState === 'disconnected';

  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden bg-card border-2",
      showConnectionIssue ? "border-destructive" : "border-border",
      isCurrentUser ? "border-primary" : ""
    )}>
      {/* Video Element */}
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Mute local video to prevent echo
          className="w-full h-full object-cover"
        />
      ) : (
        /* Avatar Placeholder */
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <Avatar
            src={participant.avatar_url}
            fallback={participant.user_name?.charAt(0) || '?'}
            size="lg"
            className="w-16 h-16"
          />
        </div>
      )}

      {/* Participant Info Overlay */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-card/80 backdrop-blur-sm text-card-foreground text-sm px-2 py-1 rounded flex items-center justify-between border border-border/20 shadow-sm">
          <span className="truncate font-medium text-card-foreground">
            {isCurrentUser ? t('you') : participant.user_name || t('unknownUser')}
          </span>
          <div className="flex items-center gap-1 ml-2">
            {/* Audio Status */}
            {participant.is_audio_enabled ? (
              <Mic className="w-3 h-3 text-success" />
            ) : (
              <MicOff className="w-3 h-3 text-destructive" />
            )}
            
            {/* Video Status */}
            {participant.is_video_enabled ? (
              <Camera className="w-3 h-3 text-success" />
            ) : (
              <CameraOff className="w-3 h-3 text-destructive" />
            )}

            {/* Connection Quality Indicator */}
            <div className={cn(
              "w-2 h-2 rounded-full",
              connectionState === 'connected' ? "bg-success" :
              connectionState === 'connecting' ? "bg-warning" :
              "bg-destructive"
            )} />
          </div>
        </div>

        {/* Connection Issue Warning */}
        {showConnectionIssue && (
          <div className="text-xs text-destructive mt-1 text-center">
            {t('connectionIssue')}
          </div>
        )}
      </div>
    </div>
  );
};

// Grid layout for video streams
const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  currentUserId,
  localStream,
  remoteStreams,
  connectionStates,
}) => {
  const gridCols = Math.min(participants.length, 3); // Max 3 columns
  const gridRows = Math.ceil(participants.length / 3);

  const gridClass = cn(
    "grid gap-2 h-full",
    participants.length === 1 ? "grid-cols-1" :
    participants.length === 2 ? "grid-cols-2" :
    participants.length <= 4 ? "grid-cols-2 grid-rows-2" :
    participants.length <= 6 ? "grid-cols-3 grid-rows-2" :
    participants.length <= 9 ? "grid-cols-3 grid-rows-3" :
    "grid-cols-4 auto-rows-fr" // For more than 9 participants
  );

  return (
    <div className={gridClass}>
      {participants.map((participant) => {
        const isCurrentUser = participant.user_id === currentUserId;
        const stream = isCurrentUser ? localStream : remoteStreams.get(participant.user_id);
        const connectionState = connectionStates.get(participant.user_id);

        return (
          <VideoStreamComponent
            key={participant.user_id}
            participant={participant}
            stream={stream}
            connectionState={connectionState}
            isLocal={isCurrentUser}
            isCurrentUser={isCurrentUser}
          />
        );
      })}
    </div>
  );
};

// Main Group Video Call Component
export const GroupVideoCall: React.FC<GroupVideoCallProps> = ({
  call,
  currentUserId,
  localStream,
  remoteStreams,
  isLocalAudioEnabled,
  isLocalVideoEnabled,
  connectionStates,
  callState,
  onEndCall,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  className,
}) => {
  const t = useTranslations('GroupCall');
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Calculate call duration
  useEffect(() => {
    const startTime = new Date(call.started_at).getTime();
    const timer = setInterval(() => {
      const now = Date.now();
      const duration = Math.floor((now - startTime) / 1000);
      setCallDuration(duration);
    }, 1000);

    return () => clearInterval(timer);
  }, [call.started_at]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const activeParticipants = call.participants.filter(p => connectionStates.get(p.user_id) !== 'failed');
  const connectionIssues = call.participants.filter(p => 
    connectionStates.get(p.user_id) === 'failed' || connectionStates.get(p.user_id) === 'disconnected'
  ).length;

  if (isMinimized) {
    return (
      <div className={cn(
        "fixed bottom-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg z-50 video-call-backdrop",
        "flex items-center gap-3 min-w-64",
        className
      )}>
        <div className="flex -space-x-2">
          {call.participants.slice(0, 3).map((participant) => (
            <Avatar
              key={participant.user_id}
              src={participant.avatar_url}
              fallback={participant.user_name?.charAt(0) || '?'}
              size="sm"
              className="border-2 border-card"
            />
          ))}
          {call.participants.length > 3 && (
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs text-muted-foreground border-2 border-card">
              +{call.participants.length - 3}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-foreground">
          <div className="text-sm font-medium truncate">{call.group_name}</div>
          <div className="text-xs text-muted-foreground">{formatDuration(callDuration)}</div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleAudio}
            className={cn(
              "w-8 h-8 p-0 video-call-button",
              isLocalAudioEnabled ? "text-success hover:text-success/80" : "text-destructive hover:text-destructive/80"
            )}
          >
            {isLocalAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(false)}
            className="w-8 h-8 p-0 text-foreground hover:text-primary video-call-button"
          >
            <Monitor className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onEndCall}
            className="w-8 h-8 p-0 text-destructive hover:text-destructive/80 video-call-button"
          >
            <PhoneOff className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Show waiting screen when connecting or no participants yet
  const showWaitingScreen = callState?.isConnecting || call.participants.length === 0;

  return (
    <div className={cn(
      "fixed inset-0 bg-background z-50 flex flex-col video-call-container",
      className
    )}>
      {showWaitingScreen ? (
        /* Waiting/Connecting Screen - Similar to VideoCall.tsx */
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-muted/50 to-background">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-success/5 to-info/5 opacity-60"></div>
          
          <div className="text-center z-10 relative flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="relative mb-6 sm:mb-8 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 flex items-center justify-center">
              {/* Multi-layer animation rings */}
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
              <div className="absolute inset-1 rounded-full bg-success/15 animate-ping" style={{ animationDelay: "0.5s" }}></div>
              <div className="absolute inset-2 rounded-full bg-info/20 animate-pulse" style={{ animationDelay: "1s" }}></div>
              <div className="absolute inset-3 rounded-full bg-primary/10 animate-pulse" style={{ animationDelay: "1.5s" }}></div>
              
              {/* Group avatar container */}
              <div
                className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground shadow-2xl border-4 border-border/50 backdrop-blur-sm transition-all duration-300 bg-gradient-to-br from-primary via-success to-info"
                style={{ 
                  boxShadow: `0 0 50px rgba(var(--primary), 0.3), inset 0 0 20px rgba(var(--background), 0.1)`
                }}
              >
                <Users className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 px-4 sm:px-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-wide transition-all duration-300" style={{ textShadow: "2px 2px 12px rgba(0,0,0,0.1)" }}>
                {call.group_name}
              </h2>
              {callState?.isConnecting && (
                <p className="text-foreground/95 text-lg sm:text-xl font-medium animate-pulse" style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.1)" }}>
                  {t('connecting')}
                </p>
              )}
              {!callState?.isConnecting && (
                <p className="text-foreground/95 text-lg sm:text-xl font-medium" style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.1)" }}>
                  {formatDuration(callDuration)} • {t('groupVideoCall')}
                </p>
              )}
            </div>
          </div>

          {/* Local video preview - similar to VideoCall */}
          {localStream && (
            <div className="absolute bottom-20 right-2 sm:bottom-24 sm:right-4 w-24 h-20 sm:w-32 sm:h-24 lg:w-40 lg:h-32 bg-muted rounded-lg overflow-hidden border-2 border-border/30 shadow-2xl transition-all duration-300 hover:scale-105 hover:border-border/50 group">
              <video 
                ref={(ref) => {
                  if (ref && localStream) {
                    ref.srcObject = localStream;
                    ref.play().catch(console.error);
                  }
                }}
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300" 
                aria-label="Your video stream"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}

          {/* Controls overlay */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-4">
              <Button
                size="lg"
                variant="ghost"
                onClick={onToggleAudio}
                className={cn(
                  "w-12 h-12 rounded-full video-call-button",
                  isLocalAudioEnabled 
                    ? "bg-accent text-foreground hover:bg-accent/80" 
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/80"
                )}
              >
                {isLocalAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>

              <Button
                size="lg"
                variant="ghost"
                onClick={onToggleVideo}
                className={cn(
                  "w-12 h-12 rounded-full video-call-button",
                  isLocalVideoEnabled 
                    ? "bg-accent text-foreground hover:bg-accent/80" 
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/80"
                )}
              >
                {isLocalVideoEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </Button>

              <Button
                size="lg"
                variant="ghost"
                onClick={onEndCall}
                className="w-12 h-12 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80 video-call-button"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Main call screen with participants */
        <>
          {/* Header */}
          <div className="bg-card/80 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between video-call-backdrop">
            <div className="flex items-center gap-3">
              <div className="text-foreground">
                <h2 className="text-lg font-semibold">{call.group_name}</h2>
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span>{formatDuration(callDuration)}</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {activeParticipants.length} {t('connected')}
                  </span>
                  {connectionIssues > 0 && (
                    <span className="text-destructive">{connectionIssues} {t('connectionIssues')}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsMinimized(true)}
                className="text-foreground hover:bg-accent video-call-button"
              >
                {t('minimize')}
              </Button>
            </div>
          </div>

          {/* Video Grid */}
          <div className="flex-1 p-4">
            <VideoGrid
              participants={call.participants}
              currentUserId={currentUserId}
              localStream={localStream}
              remoteStreams={remoteStreams}
              connectionStates={connectionStates}
            />
          </div>

          {/* Controls */}
          <div className="bg-card/80 backdrop-blur-sm border-t border-border p-4 video-call-backdrop">
            <div className="flex items-center justify-center gap-4">
              {/* Audio Toggle */}
              <Button
                size="lg"
                variant="ghost"
                onClick={onToggleAudio}
                className={cn(
                  "w-12 h-12 rounded-full video-call-button",
                  isLocalAudioEnabled 
                    ? "bg-accent text-foreground hover:bg-accent/80" 
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/80"
                )}
              >
                {isLocalAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>

              {/* Video Toggle */}
              <Button
                size="lg"
                variant="ghost"
                onClick={onToggleVideo}
                className={cn(
                  "w-12 h-12 rounded-full video-call-button",
                  isLocalVideoEnabled 
                    ? "bg-accent text-foreground hover:bg-accent/80" 
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/80"
                )}
              >
                {isLocalVideoEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </Button>

              {/* Screen Share */}
              {onToggleScreenShare && (
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={onToggleScreenShare}
                  className="w-12 h-12 rounded-full bg-accent text-foreground hover:bg-accent/80 video-call-button"
                >
                  <Monitor className="w-5 h-5" />
                </Button>
              )}

              {/* End Call */}
              <Button
                size="lg"
                variant="ghost"
                onClick={onEndCall}
                className="w-12 h-12 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80 video-call-button"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};