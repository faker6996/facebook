"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseGroupWebRTCProps {
  localUserId: number;
  onConnectionStateChange?: (participantId: number, state: RTCPeerConnectionState) => void;
  onRemoteStream?: (participantId: number, stream: MediaStream) => void;
  onRemoteStreamRemoved?: (participantId: number) => void;
}

export const useGroupWebRTC = ({ localUserId, onConnectionStateChange, onRemoteStream, onRemoteStreamRemoved }: UseGroupWebRTCProps) => {
  // State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<number, MediaStream>>(new Map());
  const [connectionStates, setConnectionStates] = useState<Map<number, RTCPeerConnectionState>>(new Map());
  const [isLocalAudioEnabled, setIsLocalAudioEnabled] = useState(true);
  const [isLocalVideoEnabled, setIsLocalVideoEnabled] = useState(true);

  // Refs
  const peerConnections = useRef<Map<number, RTCPeerConnection>>(new Map());
  const pendingCandidates = useRef<Map<number, RTCIceCandidate[]>>(new Map());

  // WebRTC Configuration
  const rtcConfig: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
  };

  // Initialize local media stream
  const initializeLocalStream = useCallback(async (isVideo: boolean = true) => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: isVideo
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
            }
          : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      setIsLocalAudioEnabled(true);
      setIsLocalVideoEnabled(isVideo);

      console.log("📹 Local stream initialized:", {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
      });

      return stream;
    } catch (error) {
      console.error("❌ Failed to initialize local stream:", error);
      throw error;
    }
  }, []);

  // Create peer connection for a participant
  const createPeerConnection = useCallback(
    (participantId: number): RTCPeerConnection => {
      console.log(`🔄 Creating peer connection for participant ${participantId}`);

      const pc = new RTCPeerConnection(rtcConfig);

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log(`🔗 Connection state for ${participantId}:`, pc.connectionState);
        setConnectionStates((prev) => new Map(prev).set(participantId, pc.connectionState));
        onConnectionStateChange?.(participantId, pc.connectionState);
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log(`📺 Received remote stream from participant ${participantId}`);
        const remoteStream = event.streams[0];

        setRemoteStreams((prev) => {
          const newStreams = new Map(prev);
          newStreams.set(participantId, remoteStream);
          return newStreams;
        });

        onRemoteStream?.(participantId, remoteStream);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`🧊 Generated ICE candidate for participant ${participantId}`);
          // This will be sent via SignalR in the calling component
          window.dispatchEvent(
            new CustomEvent("groupCallIceCandidate", {
              detail: {
                participantId,
                candidate: event.candidate,
              },
            })
          );
        }
      };

      // Add local stream tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      peerConnections.current.set(participantId, pc);
      return pc;
    },
    [localStream, onConnectionStateChange, onRemoteStream]
  );

  // Create offer for a participant
  const createOffer = useCallback(
    async (participantId: number): Promise<RTCSessionDescriptionInit> => {
      const pc = peerConnections.current.get(participantId) || createPeerConnection(participantId);

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });

        await pc.setLocalDescription(offer);
        console.log(`📤 Created offer for participant ${participantId}`);

        return offer;
      } catch (error) {
        console.error(`❌ Failed to create offer for participant ${participantId}:`, error);
        throw error;
      }
    },
    [createPeerConnection]
  );

  // Handle incoming offer
  const handleOffer = useCallback(
    async (participantId: number, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> => {
      const pc = peerConnections.current.get(participantId) || createPeerConnection(participantId);

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Process pending ICE candidates
        const pending = pendingCandidates.current.get(participantId) || [];
        for (const candidate of pending) {
          await pc.addIceCandidate(candidate);
        }
        pendingCandidates.current.delete(participantId);

        console.log(`📥 Handled offer and created answer for participant ${participantId}`);

        return answer;
      } catch (error) {
        console.error(`❌ Failed to handle offer from participant ${participantId}:`, error);
        throw error;
      }
    },
    [createPeerConnection]
  );

  // Handle incoming answer
  const handleAnswer = useCallback(async (participantId: number, answer: RTCSessionDescriptionInit) => {
    const pc = peerConnections.current.get(participantId);

    if (!pc) {
      console.error(`❌ No peer connection found for participant ${participantId}`);
      return;
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      // Process pending ICE candidates
      const pending = pendingCandidates.current.get(participantId) || [];
      for (const candidate of pending) {
        await pc.addIceCandidate(candidate);
      }
      pendingCandidates.current.delete(participantId);

      console.log(`📥 Handled answer from participant ${participantId}`);
    } catch (error) {
      console.error(`❌ Failed to handle answer from participant ${participantId}:`, error);
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (participantId: number, candidate: RTCIceCandidateInit) => {
    const pc = peerConnections.current.get(participantId);

    if (!pc) {
      console.log(`⏳ Queueing ICE candidate for participant ${participantId}`);
      const pending = pendingCandidates.current.get(participantId) || [];
      pending.push(new RTCIceCandidate(candidate));
      pendingCandidates.current.set(participantId, pending);
      return;
    }

    try {
      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`🧊 Added ICE candidate for participant ${participantId}`);
      } else {
        console.log(`⏳ Queueing ICE candidate for participant ${participantId} (no remote description)`);
        const pending = pendingCandidates.current.get(participantId) || [];
        pending.push(new RTCIceCandidate(candidate));
        pendingCandidates.current.set(participantId, pending);
      }
    } catch (error) {
      console.error(`❌ Failed to add ICE candidate for participant ${participantId}:`, error);
    }
  }, []);

  // Remove participant
  const removeParticipant = useCallback(
    (participantId: number) => {
      const pc = peerConnections.current.get(participantId);

      if (pc) {
        pc.close();
        peerConnections.current.delete(participantId);
      }

      setRemoteStreams((prev) => {
        const newStreams = new Map(prev);
        newStreams.delete(participantId);
        return newStreams;
      });

      setConnectionStates((prev) => {
        const newStates = new Map(prev);
        newStates.delete(participantId);
        return newStates;
      });

      pendingCandidates.current.delete(participantId);
      onRemoteStreamRemoved?.(participantId);

      console.log(`🚪 Removed participant ${participantId}`);
    },
    [onRemoteStreamRemoved]
  );

  // Toggle local audio
  const toggleLocalAudio = useCallback(() => {
    if (!localStream) return;

    const audioTracks = localStream.getAudioTracks();
    const newEnabled = !isLocalAudioEnabled;

    audioTracks.forEach((track) => {
      track.enabled = newEnabled;
    });

    setIsLocalAudioEnabled(newEnabled);
    console.log(`🎤 Local audio ${newEnabled ? "enabled" : "disabled"}`);

    return newEnabled;
  }, [localStream, isLocalAudioEnabled]);

  // Toggle local video
  const toggleLocalVideo = useCallback(() => {
    if (!localStream) return;

    const videoTracks = localStream.getVideoTracks();
    const newEnabled = !isLocalVideoEnabled;

    videoTracks.forEach((track) => {
      track.enabled = newEnabled;
    });

    setIsLocalVideoEnabled(newEnabled);
    console.log(`📹 Local video ${newEnabled ? "enabled" : "disabled"}`);

    return newEnabled;
  }, [localStream, isLocalVideoEnabled]);

  // Cleanup
  const cleanup = useCallback(() => {
    console.log("🧹 Cleaning up WebRTC resources");

    // Close all peer connections
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    // Stop local stream
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);

    // Clear state
    setRemoteStreams(new Map());
    setConnectionStates(new Map());
    pendingCandidates.current.clear();

    setIsLocalAudioEnabled(true);
    setIsLocalVideoEnabled(true);
  }, [localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // Streams
    localStream,
    remoteStreams,

    // Connection states
    connectionStates,

    // Media controls
    isLocalAudioEnabled,
    isLocalVideoEnabled,
    toggleLocalAudio,
    toggleLocalVideo,

    // WebRTC methods
    initializeLocalStream,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    removeParticipant,
    cleanup,
  };
};
