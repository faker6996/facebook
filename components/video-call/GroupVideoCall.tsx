"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
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

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (stream) {
      // Simple approach like 2-person call - just set srcObject
      videoElement.srcObject = stream;
    } else {
      // Clear srcObject when no stream
      videoElement.srcObject = null;
    }
  }, [stream]);

  // Simplify video display logic like 2-person call
  const showVideo = stream && participant.is_video_enabled;
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

// Grid layout for video streams - memoized for performance
const VideoGrid: React.FC<VideoGridProps> = React.memo(({
  participants,
  currentUserId,
  localStream,
  remoteStreams,
  connectionStates,
  isLocalAudioEnabled,
  isLocalVideoEnabled,
}) => {
  // Create local participant if not already in the list - memoized
  const hasLocalParticipant = useMemo(() => 
    participants.some((p) => p.user_id === currentUserId),
    [participants, currentUserId]
  );
  
  const allParticipants = useMemo(() => hasLocalParticipant
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
      ], [hasLocalParticipant, participants, currentUserId, isLocalAudioEnabled, isLocalVideoEnabled]);

  console.log('🎥 VideoGrid debug:', {
    originalParticipants: participants.length,
    hasLocalParticipant,
    currentUserId,
    allParticipants: allParticipants.length,
    localStreamAvailable: !!localStream,
    participants: allParticipants.map(p => ({
      id: p.user_id,
      name: p.user_name,
      isLocal: p.user_id === currentUserId,
      videoEnabled: p.is_video_enabled
    }))
  });

  // Memoize grid class calculation
  const gridClass = useMemo(() => cn(
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
  ), [allParticipants.length]);

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
});

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

  // Check if there are other participants (memoized to prevent recalculation)
  const hasOtherParticipants = useMemo(() => 
    call.participants.some(p => p.user_id !== currentUserId), 
    [call.participants, currentUserId]
  );

  // Memoize other participants for duration calculation
  const otherParticipants = useMemo(() => 
    call.participants.filter(p => p.user_id !== currentUserId),
    [call.participants, currentUserId]
  );

  // Calculate call duration - only start counting when someone else joins
  useEffect(() => {
    // Only start timer when there are other participants (not just initiator)
    if (!hasOtherParticipants) {
      setCallDuration(0);
      return;
    }

    // Find the earliest join time among other participants
    const earliestJoinTime = otherParticipants.length > 0 
      ? Math.min(...otherParticipants.map(p => new Date(p.joined_at).getTime()))
      : Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      const duration = Math.floor((now - earliestJoinTime) / 1000);
      setCallDuration(Math.max(0, duration));
    }, 1000);

    return () => clearInterval(timer);
  }, [hasOtherParticipants, otherParticipants]);

  // Memoize format duration function
  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Memoize expensive calculations
  const activeParticipants = useMemo(() => 
    call.participants.filter((p) => connectionStates.get(p.user_id) !== "failed"),
    [call.participants, connectionStates]
  );
  
  const connectionIssues = useMemo(() => 
    call.participants.filter(
      (p) => connectionStates.get(p.user_id) === "failed" || connectionStates.get(p.user_id) === "disconnected"
    ).length,
    [call.participants, connectionStates]
  );

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

  // Show waiting screen when connecting OR when no other participants have joined yet - memoized
  // For group calls, we should show waiting screen until at least one other person joins
  const showWaitingScreen = useMemo(() => 
    callState?.isConnecting === true || !hasOtherParticipants,
    [callState?.isConnecting, hasOtherParticipants]
  );

  // Debug logging
  console.log('🎥 GroupVideoCall render debug:', {
    participantsCount: call.participants.length,
    hasLocalStream: !!localStream,
    localStreamTracks: localStream?.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled })),
    isConnecting: callState?.isConnecting,
    currentUserId,
    isLocalVideoEnabled,
    isLocalAudioEnabled,
    callId: call.id,
    groupName: call.group_name,
    hasOtherParticipants,
    showWaitingScreen,
    participants: call.participants.map(p => ({
      id: p.user_id,
      name: p.user_name,
      isCurrentUser: p.user_id === currentUserId
    }))
  });

  return (
    <div className={cn("fixed inset-0 bg-background z-50 flex flex-col video-call-container", className)}>
      {showWaitingScreen ? (
        <div className="relative w-full h-full">
          {/* Enhanced Waiting Screen - Using shared component */}
          <VideoCallWaitingScreen
            title={call.group_name}
            subtitle={
              callState?.isConnecting 
                ? t("startingCall")
                : hasOtherParticipants 
                  ? `${formatDuration(callDuration)} • ${t("groupVideoCall")}`
                  : t("waitingForOthersToJoin")
            }
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
