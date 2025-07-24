"use client";

import React, { useEffect, useRef, useState } from "react";
import { Phone, PhoneOff, Mic, MicOff, Camera, CameraOff, Monitor, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { GroupCall, CallParticipant } from "@/lib/models/group-call";
import { cn } from "@/lib/utils/cn";
import { VideoCallControls } from "./VideoCallControls";
import { VideoCallWaitingScreen } from "./VideoCallWaitingScreen";

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
  isLocalAudioEnabled: boolean;
  isLocalVideoEnabled: boolean;
}

// Component for individual video stream
const VideoStreamComponent: React.FC<{
  participant: CallParticipant;
  stream?: MediaStream;
  connectionState?: RTCPeerConnectionState;
  isLocal?: boolean;
  isCurrentUser?: boolean;
}> = ({ participant, stream, connectionState, isLocal = false, isCurrentUser = false }) => {
  const t = useTranslations("GroupCall");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Reset playing state when stream changes
    setIsVideoPlaying(false);

    if (stream) {
      // Clear previous stream if any
      if (videoElement.srcObject) {
        videoElement.srcObject = null;
      }

      videoElement.srcObject = stream;

      // Handle play promise properly to avoid interruption errors
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoPlaying(true);
          })
          .catch((error) => {
            console.warn("Video play was interrupted:", error);
            // Don't set isVideoPlaying to true if play failed
          });
      }
    } else {
      // Clear srcObject when no stream
      videoElement.srcObject = null;
    }

    // Cleanup function
    return () => {
      if (videoElement && videoElement.srcObject) {
        videoElement.pause();
        videoElement.srcObject = null;
      }
    };
  }, [stream]);

  const showVideo = stream && participant.is_video_enabled && (isLocal || isVideoPlaying);
  const showConnectionIssue = connectionState === "failed" || connectionState === "disconnected";

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden bg-card border-2",
        showConnectionIssue ? "border-destructive" : "border-border",
        isCurrentUser ? "border-primary" : ""
      )}
    >
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
          <Avatar src={participant.avatar_url} fallback={participant.user_name?.charAt(0) || "?"} size="lg" className="w-16 h-16" />
        </div>
      )}

      {/* Participant Info Overlay */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-card/80 backdrop-blur-sm text-card-foreground text-sm px-2 py-1 rounded flex items-center justify-between border border-border/20 shadow-sm">
          <span className="truncate font-medium text-card-foreground">{isCurrentUser ? t("you") : participant.user_name || t("unknownUser")}</span>
          <div className="flex items-center gap-1 ml-2">
            {/* Audio Status */}
            {participant.is_audio_enabled ? <Mic className="w-3 h-3 text-success" /> : <MicOff className="w-3 h-3 text-destructive" />}

            {/* Video Status */}
            {participant.is_video_enabled ? <Camera className="w-3 h-3 text-success" /> : <CameraOff className="w-3 h-3 text-destructive" />}

            {/* Connection Quality Indicator */}
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                connectionState === "connected" ? "bg-success" : connectionState === "connecting" ? "bg-warning" : "bg-destructive"
              )}
            />
          </div>
        </div>

        {/* Connection Issue Warning */}
        {showConnectionIssue && <div className="text-xs text-destructive mt-1 text-center">{t("connectionIssue")}</div>}
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
  isLocalAudioEnabled,
  isLocalVideoEnabled,
}) => {
  // Create local participant if not already in the list
  const hasLocalParticipant = participants.some((p) => p.user_id === currentUserId);
  const allParticipants = hasLocalParticipant
    ? participants
    : [
        {
          user_id: currentUserId,
          user_name: "You",
          avatar_url: "",
          is_audio_enabled: isLocalAudioEnabled,
          is_video_enabled: isLocalVideoEnabled,
          connection_quality: "good" as const,
          joined_at: new Date().toISOString(),
        },
        ...participants,
      ];

  const gridCols = Math.min(allParticipants.length, 3); // Max 3 columns
  const gridRows = Math.ceil(allParticipants.length / 3);

  const gridClass = cn(
    "grid gap-2 h-full",
    allParticipants.length === 1
      ? "grid-cols-1"
      : allParticipants.length === 2
      ? "grid-cols-2"
      : allParticipants.length <= 4
      ? "grid-cols-2 grid-rows-2"
      : allParticipants.length <= 6
      ? "grid-cols-3 grid-rows-2"
      : allParticipants.length <= 9
      ? "grid-cols-3 grid-rows-3"
      : "grid-cols-4 auto-rows-fr" // For more than 9 participants
  );

  return (
    <div className={gridClass}>
      {allParticipants.map((participant) => {
        const isCurrentUser = participant.user_id === currentUserId;
        const stream = isCurrentUser ? localStream : remoteStreams.get(participant.user_id);
        const connectionState = connectionStates.get(participant.user_id) || "connected";

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
  const t = useTranslations("GroupCall");
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
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const activeParticipants = call.participants.filter((p) => connectionStates.get(p.user_id) !== "failed");
  const connectionIssues = call.participants.filter(
    (p) => connectionStates.get(p.user_id) === "failed" || connectionStates.get(p.user_id) === "disconnected"
  ).length;

  if (isMinimized) {
    return (
      <div
        className={cn(
          "fixed bottom-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg z-50 video-call-backdrop",
          "flex items-center gap-3 min-w-64",
          className
        )}
      >
        <div className="flex -space-x-2">
          {call.participants.slice(0, 3).map((participant) => (
            <Avatar
              key={participant.user_id}
              src={participant.avatar_url}
              fallback={participant.user_name?.charAt(0) || "?"}
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

          <Button size="sm" variant="ghost" onClick={onEndCall} className="w-8 h-8 p-0 text-destructive hover:text-destructive/80 video-call-button">
            <PhoneOff className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Show waiting screen only when actively connecting
  // If this component is rendered, call is considered active
  const showWaitingScreen = callState?.isConnecting === true;

  return (
    <div className={cn("fixed inset-0 bg-background z-50 flex flex-col video-call-container", className)}>
      {showWaitingScreen ? (
        <div className="relative w-full h-full">
          {/* Enhanced Waiting Screen - Using shared component */}
          <VideoCallWaitingScreen
            title={call.group_name}
            subtitle={!callState?.isConnecting ? `${formatDuration(callDuration)} • ${t("groupVideoCall")}` : undefined}
            isConnecting={callState?.isConnecting}
            callDuration={callDuration}
            fallbackIcon={<Users className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 animate-pulse" />}
            localStream={localStream}
            isLocalVideoEnabled={isLocalVideoEnabled}
            currentUserName={t("you")}
          />

          {/* Enhanced Controls - Using shared component */}
          <VideoCallControls
            isAudioEnabled={isLocalAudioEnabled}
            isVideoEnabled={isLocalVideoEnabled}
            onToggleAudio={onToggleAudio}
            onToggleVideo={onToggleVideo}
            onEndCall={onEndCall}
            onToggleScreenShare={onToggleScreenShare}
            variant="waiting"
          />
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
                    {activeParticipants.length} {t("connected")}
                  </span>
                  {connectionIssues > 0 && (
                    <span className="text-destructive">
                      {connectionIssues} {t("connectionIssues")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setIsMinimized(true)} className="text-foreground hover:bg-accent video-call-button">
                {t("minimize")}
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
              isLocalAudioEnabled={isLocalAudioEnabled}
              isLocalVideoEnabled={isLocalVideoEnabled}
            />
          </div>

          {/* Enhanced Controls - Using shared component */}
          <VideoCallControls
            isAudioEnabled={isLocalAudioEnabled}
            isVideoEnabled={isLocalVideoEnabled}
            onToggleAudio={onToggleAudio}
            onToggleVideo={onToggleVideo}
            onEndCall={onEndCall}
            onToggleScreenShare={onToggleScreenShare}
            variant="active"
          />
        </>
      )}
    </div>
  );
};
