"use client";

import { useEffect, useState, useCallback } from "react";
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

  // Use group call hook - now the only instance
  const groupCall = useGroupCall({
    currentUser,
    onCallStateChange: (isActive: boolean) => {

      if (isActive) {
        // Call started - notify all messenger containers with groupId (async to avoid setState in render)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('globalGroupCallStarted', {
            detail: { groupId: groupCall.currentCall?.group_id }
          }));
        }, 0);
      } else {
        // Call ended - reset state and notify with groupId (async to avoid setState in render)
        setGlobalCallState({
          isCallActive: false,
          isIncomingCall: false,
          isOutgoingCall: false,
        });
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('globalGroupCallEnded', {
            detail: { groupId: groupCall.currentCall?.group_id || globalCallState.groupId }
          }));
        }, 0);
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
  });

  // Listen for incoming calls and show modal - optimized to reduce re-renders
  useEffect(() => {
    if (groupCall.callState.isIncomingCall && groupCall.incomingCallData) {
      
      // Only update if different from current state
      setIncomingCallData((prevData: any) => {
        if (prevData?.call?.id !== groupCall.incomingCallData?.call?.id) {
          return groupCall.incomingCallData;
        }
        return prevData;
      });
      
      setGlobalCallState((prev) => {
        const newCallId = groupCall.incomingCallData?.call?.id;
        const newGroupName = groupCall.incomingCallData?.call?.group_name;
        const newGroupId = groupCall.incomingCallData?.group_id;
        
        // Only update if values have changed
        if (prev.callId !== newCallId || prev.groupName !== newGroupName || !prev.isIncomingCall) {
          return {
            ...prev,
            isIncomingCall: true,
            groupName: newGroupName,
            groupId: newGroupId,
            callId: newCallId,
          };
        }
        return prev;
      });
    } else {
    }
  }, [groupCall.callState.isIncomingCall, groupCall.incomingCallData]);

  // Listen for call state changes from hook - optimized
  useEffect(() => {
    // If hook says call is active but global state doesn't, sync it
    if (groupCall.callState.isActive && groupCall.currentCall && !globalCallState.isCallActive) {
      setGlobalCallState((prev) => ({
        ...prev,
        isCallActive: true,
        isIncomingCall: false,
      }));
    }
    // Also handle the reverse case - hook says not active but global state says active
    else if (!groupCall.callState.isActive && globalCallState.isCallActive) {
      setGlobalCallState((prev) => ({
        ...prev,
        isCallActive: false,
        isIncomingCall: false,
        isOutgoingCall: false,
      }));
    }
  }, [groupCall.callState.isActive, groupCall.currentCall, globalCallState.isCallActive]);

  // Listen for global group call start events (like 2-person call pattern)
  useEffect(() => {
    if (!isConnected) return;

    const handleStartGroupCall = (event: any) => {
      const { groupId, groupName, callType } = event.detail;

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

    const handleJoinGroupCall = (event: any) => {
      const { callId, groupId, groupName, callType } = event.detail;

      // Set connecting state
      setGlobalCallState({
        isCallActive: true,
        isIncomingCall: false,
        isOutgoingCall: false,
        groupName,
        groupId,
        callId,
      });

      // Join the call using the hook
      groupCall.joinGroupCall(callId);
    };

    window.addEventListener("startGlobalGroupCall", handleStartGroupCall);
    window.addEventListener("joinGlobalGroupCall", handleJoinGroupCall);

    return () => {
      window.removeEventListener("startGlobalGroupCall", handleStartGroupCall);
      window.removeEventListener("joinGlobalGroupCall", handleJoinGroupCall);
    };
  }, [isConnected, groupCall]);

  // Handle accept incoming call
  const handleAcceptCall = async () => {
    
    if (incomingCallData?.call?.id) {
      try {
        await groupCall.joinGroupCall(incomingCallData.call.id);
        
        


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
        console.error("Failed to join group call:", error);
        // Reset state on error
        setIncomingCallData(null);
        setGlobalCallState((prev) => ({ ...prev, isIncomingCall: false }));
      }
    } else {
      console.error("No call ID found in incoming call data");
    }
  };

  // Handle decline incoming call
  const handleDeclineCall = () => {
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

        if (isInitiator) {
          groupCall.endGroupCall();
        } else {
          groupCall.leaveGroupCall();
        }
      }}
      onToggleAudio={groupCall.toggleAudio}
      onToggleVideo={groupCall.toggleVideo}
      className="global-group-video-call"
    />
  );
}
