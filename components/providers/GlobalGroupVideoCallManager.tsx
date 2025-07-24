"use client";

import { useEffect, useState } from "react";
import { useSignalR } from "@/contexts/SignalRContext";
import { GroupVideoCall } from "@/components/video-call/GroupVideoCall";
import { useGroupCall } from "@/hooks/useGroupCall";
import { loadFromLocalStorage } from "@/lib/utils/local-storage";
import { User } from "@/lib/models/user";
import { Phone, PhoneOff } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

interface GroupCallState {
  isCallActive: boolean;
  isIncomingCall: boolean;
  isOutgoingCall: boolean;
  groupName?: string;
  groupId?: number;
  callId?: string;
}

export function GlobalGroupVideoCallManager() {
  const { isConnected } = useSignalR();
  const t = useTranslations("GroupCall");
  const [currentUser, setCurrentUser] = useState<User>({});
  const [globalCallState, setGlobalCallState] = useState<GroupCallState>({
    isCallActive: false,
    isIncomingCall: false,
    isOutgoingCall: false,
  });
  const [incomingCallData, setIncomingCallData] = useState<any>(null);

  // Initialize user from localStorage
  useEffect(() => {
    const user = loadFromLocalStorage("user", User) || {};
    setCurrentUser(user);
  }, []);

  // Group call events following same pattern as 2-person call
  const groupCallEvents = {
    onIncomingCall: (groupId: number, groupName: string, callId: string) => {
      console.log("🌐 Global incoming group call:", { groupName, groupId, callId });

      setGlobalCallState({
        isCallActive: true,
        isIncomingCall: true,
        isOutgoingCall: false,
        groupName,
        groupId,
        callId,
      });
    },
    onCallStateChange: (isActive: boolean) => {
      console.log("🌐 Global group call state changed:", isActive);

      if (!isActive) {
        // Call ended - reset state
        setGlobalCallState({
          isCallActive: false,
          isIncomingCall: false,
          isOutgoingCall: false,
        });
      }
    },
    onError: (error: string) => {
      console.error("🌐 Global group call error:", error);
      // Reset state on error
      setGlobalCallState({
        isCallActive: false,
        isIncomingCall: false,
        isOutgoingCall: false,
      });
    },
  };

  // Use group call hook with global flag
  const groupCall = useGroupCall({
    currentUser,
    onCallStateChange: groupCallEvents.onCallStateChange,
    onError: groupCallEvents.onError,
    isGlobal: true, // This prevents duplicate event handling
  });

  // Listen for incoming calls and show modal
  useEffect(() => {
    if (groupCall.callState.isIncomingCall && groupCall.incomingCallData) {
      console.log("🌐 Global incoming call detected:", groupCall.incomingCallData);
      setIncomingCallData(groupCall.incomingCallData);
      setGlobalCallState((prev) => ({
        ...prev,
        isIncomingCall: true,
        groupName: groupCall.incomingCallData?.call?.group_name,
        groupId: groupCall.incomingCallData?.group_id,
        callId: groupCall.incomingCallData?.call?.id,
      }));
    } else {
      console.log("🌐 Incoming call condition not met");
    }
  }, [groupCall.callState.isIncomingCall, groupCall.incomingCallData]);

  // Listen for call state changes from hook
  useEffect(() => {
    // If hook says call is active but global state doesn't, sync it
    if (groupCall.callState.isActive && groupCall.currentCall && !globalCallState.isCallActive) {
      console.log("🌐 Syncing global state with hook state - call is active");
      setGlobalCallState((prev) => ({
        ...prev,
        isCallActive: true,
        isIncomingCall: false,
      }));
    }
  }, [groupCall.callState.isActive, groupCall.currentCall, globalCallState.isCallActive]);

  // Listen for global group call start events (like 2-person call pattern)
  useEffect(() => {
    if (!isConnected) return;

    const handleStartGroupCall = (event: any) => {
      const { groupId, groupName, callType } = event.detail;
      console.log("🌐 Starting global group call:", { groupId, groupName, callType });

      setGlobalCallState({
        isCallActive: true,
        isIncomingCall: false,
        isOutgoingCall: true,
        groupName,
        groupId,
      });

      // Start the call using the hook
      groupCall.startGroupCall(groupId, callType);
    };

    window.addEventListener("startGlobalGroupCall", handleStartGroupCall);

    return () => {
      window.removeEventListener("startGlobalGroupCall", handleStartGroupCall);
    };
  }, [isConnected, groupCall]);

  // Handle accept incoming call
  const handleAcceptCall = async () => {
    if (incomingCallData?.call?.id) {
      try {
        console.log("🌐 Starting joinGroupCall...");
        await groupCall.joinGroupCall(incomingCallData.call.id);
        console.log("🌐 joinGroupCall completed, checking state...");

        // Wait a bit for state to update
        setTimeout(() => {
          console.log("🌐 Post-join state check:", {
            hookCallActive: groupCall.callState.isActive,
            currentCall: !!groupCall.currentCall,
            globalState: globalCallState,
          });
        }, 500);

        console.log("🌐 Successfully joined group call, updating state");

        // Clear incoming call state and set as active
        setIncomingCallData(null);
        setGlobalCallState((prev) => ({
          ...prev,
          isIncomingCall: false,
          isCallActive: true, // Important: Set active to show GroupVideoCall
          groupName: prev.groupName,
          groupId: prev.groupId,
          callId: incomingCallData.call.id,
        }));
      } catch (error) {
        console.error("🌐 Failed to join group call:", error);
        // Reset state on error
        setIncomingCallData(null);
        setGlobalCallState((prev) => ({ ...prev, isIncomingCall: false }));
      }
    }
  };

  // Handle decline incoming call
  const handleDeclineCall = () => {
    console.log("🌐 Declining incoming group call");
    setIncomingCallData(null);
    setGlobalCallState((prev) => ({ ...prev, isIncomingCall: false }));
  };

  if (globalCallState.isIncomingCall && incomingCallData) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-background/95 via-background/90 to-muted/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 video-call-backdrop">
        <div className="relative max-w-sm w-full">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-success/10 to-info/20 rounded-3xl blur-xl opacity-60"></div>
          <div className="absolute inset-1 bg-gradient-to-br from-card/90 to-card/95 rounded-2xl backdrop-blur-sm border border-border/50"></div>

          {/* Main content */}
          <div className="relative p-8 text-center">
            {/* Animated avatar section */}
            <div className="relative mb-8 flex items-center justify-center">
              {/* Multi-layer animation rings */}
              <div className="absolute inset-0 w-32 h-32 rounded-full bg-primary/20 animate-ping"></div>
              <div className="absolute inset-2 w-28 h-28 rounded-full bg-success/15 animate-ping" style={{ animationDelay: "0.5s" }}></div>
              <div className="absolute inset-4 w-24 h-24 rounded-full bg-info/20 animate-pulse" style={{ animationDelay: "1s" }}></div>

              {/* Avatar container */}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-success to-info flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-2xl border-4 border-background/20">
                <Phone className="w-10 h-10 animate-pulse" />
              </div>
            </div>

            {/* Call information */}
            <div className="space-y-3 mb-8">
              <h3 className="text-2xl font-bold text-foreground tracking-wide" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
                {t("incomingCall")}
              </h3>
              <p className="text-lg font-semibold text-foreground/90">{incomingCallData?.call?.group_name || t("groupVideoCall")}</p>
              <p className="text-sm text-muted-foreground font-medium animate-pulse">
                {incomingCallData?.call?.initiator_name || "Someone"} {t("isCalling")}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleDeclineCall}
                className="flex-1 h-14 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border-2 border-destructive/30 hover:border-destructive rounded-2xl transition-all duration-300 hover:scale-105 video-call-button group"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-destructive/20 group-hover:bg-destructive-foreground/20 rounded-full flex items-center justify-center transition-all duration-300">
                    <PhoneOff className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">{t("declineCall")}</span>
                </div>
              </Button>

              <Button
                onClick={handleAcceptCall}
                className="flex-1 h-14 bg-success hover:bg-success/90 text-success-foreground rounded-2xl transition-all duration-300 hover:scale-105 video-call-button group shadow-lg hover:shadow-success/25"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-success-foreground/20 group-hover:bg-success-foreground/30 rounded-full flex items-center justify-center transition-all duration-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">{t("acceptCall")}</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error message if camera/microphone access failed (like 2-person call)
  if (groupCall.cameraError && !groupCall.callState.isActive) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-lg p-6 max-w-md w-full border shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-destructive">Call Failed</h3>
          <p className="text-sm text-muted-foreground mb-4">{groupCall.cameraError}</p>
          <button
            onClick={() => setGlobalCallState({ isCallActive: false, isIncomingCall: false, isOutgoingCall: false })}
            className="w-full bg-primary text-primary-foreground rounded-md py-2 px-4"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Only render if there's an active call OR the hook says call is active
  // This ensures we show GroupVideoCall after successful join
  const shouldShowVideoCall = (globalCallState.isCallActive && groupCall.currentCall) || (groupCall.callState.isActive && groupCall.currentCall);

  if (!shouldShowVideoCall) {
    return null;
  }

  // TypeScript guard - ensure currentCall exists
  if (!groupCall.currentCall) {
    console.log("🌐 No currentCall available, cannot render GroupVideoCall");
    return null;
  }

  return (
    <GroupVideoCall
      call={groupCall.currentCall}
      currentUserId={currentUser.id || 0}
      localStream={groupCall.localStream || undefined}
      remoteStreams={groupCall.remoteStreams}
      isLocalAudioEnabled={groupCall.callState.isLocalAudioEnabled}
      isLocalVideoEnabled={groupCall.callState.isLocalVideoEnabled}
      connectionStates={groupCall.connectionStates}
      callState={groupCall.callState}
      onEndCall={() => {
        // Check if current user is the initiator (like 2-person call pattern)
        const isInitiator = groupCall.currentCall?.initiator_id === currentUser.id;
        console.log("🌐 Global end call action:", {
          isInitiator,
          initiatorId: groupCall.currentCall?.initiator_id,
          currentUserId: currentUser.id,
        });

        if (isInitiator) {
          console.log("🌐 Ending call as initiator");
          groupCall.endGroupCall();
        } else {
          console.log("🌐 Leaving call as participant");
          groupCall.leaveGroupCall();
        }
      }}
      onToggleAudio={groupCall.toggleAudio}
      onToggleVideo={groupCall.toggleVideo}
      className="global-group-video-call"
    />
  );
}
