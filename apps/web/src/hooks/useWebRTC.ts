import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientEvent, ServerEvent } from "@owly/shared";

type SignalData = Extract<ServerEvent, { type: "webrtc.signal" }>["data"];
type VideoStateData = Extract<ServerEvent, { type: "video.state" }>["data"];

export type WebrtcInboundHandlers = {
  onSignal: (data: SignalData) => void;
  onVideoState: (data: VideoStateData) => void;
};

export type VideoStatus =
  | "idle"
  | "requesting"
  | "connecting"
  | "connected"
  | "permission_denied"
  | "error";

interface UseWebRTCOptions {
  enabled: boolean;
  roomId: string | null;
  initiator: boolean | null;
  send: (event: ClientEvent) => void;
  handlersRef: React.MutableRefObject<WebrtcInboundHandlers | null>;
}

const DEFAULT_STUN = "stun:stun.l.google.com:19302";
const CONNECTING_TIMEOUT_MS = 10_000;

function getIceServers(): RTCIceServer[] {
  const stun =
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env?.VITE_STUN_URL) ||
    DEFAULT_STUN;
  return [{ urls: stun }];
}

function streamHasLiveTracks(stream: MediaStream | null): boolean {
  return !!stream?.getTracks().some((t) => t.readyState === "live");
}

export function useWebRTC({
  enabled,
  roomId,
  initiator,
  send,
  handlersRef,
}: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<VideoStatus>("idle");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [partnerCameraOn, setPartnerCameraOn] = useState(true);
  const [partnerMicOn, setPartnerMicOn] = useState(true);
  const [partnerMediaAvailable, setPartnerMediaAvailable] = useState(true);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingSignalsRef = useRef<SignalData[]>([]);
  const makingOfferRef = useRef(false);
  const roomIdRef = useRef(roomId);
  const initiatorRef = useRef(initiator);
  const sendRef = useRef(send);
  const statusRef = useRef<VideoStatus>("idle");
  const partnerMediaAvailableRef = useRef(true);
  const connectingTimerRef = useRef<number | null>(null);
  const acquirePromiseRef = useRef<Promise<MediaStream | null> | null>(null);
  const cameraOnRef = useRef(true);
  const micOnRef = useRef(true);

  roomIdRef.current = roomId;
  initiatorRef.current = initiator;
  sendRef.current = send;
  cameraOnRef.current = cameraOn;
  micOnRef.current = micOn;

  const updateStatus = useCallback((next: VideoStatus) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const clearConnectingTimer = useCallback(() => {
    if (connectingTimerRef.current) {
      window.clearTimeout(connectingTimerRef.current);
      connectingTimerRef.current = null;
    }
  }, []);

  const markConnectedIfWaiting = useCallback(() => {
    if (statusRef.current === "connecting") {
      updateStatus("connected");
    }
  }, [updateStatus]);

  const armConnectingTimer = useCallback(() => {
    clearConnectingTimer();
    connectingTimerRef.current = window.setTimeout(() => {
      connectingTimerRef.current = null;
      if (statusRef.current !== "connecting") return;
      if (!remoteStreamRef.current) {
        partnerMediaAvailableRef.current = false;
        setPartnerMediaAvailable(false);
        setPartnerCameraOn(false);
      }
      updateStatus("connected");
    }, CONNECTING_TIMEOUT_MS);
  }, [clearConnectingTimer, updateStatus]);

  /** Close peer connection and remote media; keep local camera/mic stream. */
  const teardownPeer = useCallback(() => {
    pendingSignalsRef.current = [];
    makingOfferRef.current = false;
    clearConnectingTimer();

    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      try {
        pcRef.current.close();
      } catch {
        // ignore
      }
      pcRef.current = null;
    }

    if (remoteStreamRef.current) {
      for (const track of remoteStreamRef.current.getTracks()) {
        track.stop();
      }
      remoteStreamRef.current = null;
    }

    setRemoteStream(null);
    setPartnerCameraOn(true);
    setPartnerMicOn(true);
    partnerMediaAvailableRef.current = true;
    setPartnerMediaAvailable(true);

    const current = statusRef.current;
    if (current !== "permission_denied" && current !== "error" && current !== "requesting") {
      updateStatus("idle");
    }
  }, [clearConnectingTimer, updateStatus]);

  /** Stop local tracks and clear media state (Stop / idle / unmount). */
  const releaseLocalMedia = useCallback(() => {
    acquirePromiseRef.current = null;
    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        track.stop();
      }
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setCameraOn(true);
    setMicOn(true);
    cameraOnRef.current = true;
    micOnRef.current = true;
    if (statusRef.current === "permission_denied" || statusRef.current === "error") {
      updateStatus("idle");
    } else if (!pcRef.current && statusRef.current !== "requesting") {
      updateStatus("idle");
    }
  }, [updateStatus]);

  const teardown = useCallback(() => {
    teardownPeer();
    releaseLocalMedia();
    updateStatus("idle");
  }, [teardownPeer, releaseLocalMedia, updateStatus]);

  const ensureLocalMedia = useCallback(async (): Promise<MediaStream | null> => {
    if (streamHasLiveTracks(localStreamRef.current)) {
      return localStreamRef.current;
    }

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        track.stop();
      }
      localStreamRef.current = null;
      setLocalStream(null);
    }

    if (acquirePromiseRef.current) {
      return acquirePromiseRef.current;
    }

    updateStatus("requesting");

    const acquire = (async (): Promise<MediaStream | null> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        setCameraOn(true);
        setMicOn(true);
        cameraOnRef.current = true;
        micOnRef.current = true;
        if (statusRef.current === "requesting") {
          updateStatus("idle");
        }
        return stream;
      } catch (err: any) {
        const denied =
          err?.name === "NotAllowedError" ||
          err?.name === "PermissionDeniedError";
        updateStatus(denied ? "permission_denied" : "error");
        setCameraOn(false);
        setMicOn(false);
        cameraOnRef.current = false;
        micOnRef.current = false;
        return null;
      } finally {
        acquirePromiseRef.current = null;
      }
    })();

    acquirePromiseRef.current = acquire;
    return acquire;
  }, [updateStatus]);

  const applySignal = useCallback(
    async (pc: RTCPeerConnection, data: SignalData) => {
      try {
        if (data.kind === "offer" && data.sdp) {
          if (makingOfferRef.current) return;
          await pc.setRemoteDescription({ type: "offer", sdp: data.sdp });
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendRef.current({
            type: "webrtc.signal",
            data: { kind: "answer", sdp: answer.sdp ?? undefined },
          });
        } else if (data.kind === "answer" && data.sdp) {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription({ type: "answer", sdp: data.sdp });
          }
        } else if (data.kind === "ice" && data.candidate) {
          try {
            await pc.addIceCandidate(data.candidate as RTCIceCandidateInit);
          } catch (err) {
            // Candidate may arrive before remote description; ignore benign failures
            if (pc.remoteDescription) {
              console.warn("Failed to add ICE candidate", err);
            }
          }
        }
      } catch (err) {
        console.error("Failed to apply WebRTC signal", err);
      }
    },
    []
  );

  const flushPendingSignals = useCallback(
    async (pc: RTCPeerConnection) => {
      const queued = pendingSignalsRef.current.splice(0);
      for (const signal of queued) {
        await applySignal(pc, signal);
      }
    },
    [applySignal]
  );

  const handleInboundSignal = useCallback(
    async (data: SignalData) => {
      const pc = pcRef.current;
      if (!pc) {
        pendingSignalsRef.current.push(data);
        return;
      }
      await applySignal(pc, data);
    },
    [applySignal]
  );

  const handleInboundVideoState = useCallback(
    (data: VideoStateData) => {
      setPartnerCameraOn(data.cameraOn);
      setPartnerMicOn(data.micOn);
      if (data.available === false) {
        partnerMediaAvailableRef.current = false;
        setPartnerMediaAvailable(false);
        clearConnectingTimer();
        markConnectedIfWaiting();
      }
    },
    [clearConnectingTimer, markConnectedIfWaiting]
  );

  const teardownRef = useRef(teardown);
  teardownRef.current = teardown;

  useEffect(() => {
    handlersRef.current = {
      onSignal: handleInboundSignal,
      onVideoState: handleInboundVideoState,
    };
    return () => {
      handlersRef.current = null;
    };
  }, [handlersRef, handleInboundSignal, handleInboundVideoState]);

  useEffect(() => {
    return () => {
      teardownRef.current();
    };
  }, []);

  useEffect(() => {
    if (!enabled || !roomId || initiator === null) {
      teardownPeer();
      return;
    }

    let cancelled = false;

    async function startPeer(stream: MediaStream | null) {
      if (cancelled) {
        return;
      }

      if (stream) {
        localStreamRef.current = stream;
        setLocalStream(stream);
        const videoEnabled = stream.getVideoTracks()[0]?.enabled ?? true;
        const audioEnabled = stream.getAudioTracks()[0]?.enabled ?? true;
        setCameraOn(videoEnabled);
        setMicOn(audioEnabled);
        cameraOnRef.current = videoEnabled;
        micOnRef.current = audioEnabled;
        if (partnerMediaAvailableRef.current && statusRef.current !== "connected") {
          updateStatus("connecting");
          armConnectingTimer();
        } else {
          updateStatus("connected");
        }
      }

      const pc = new RTCPeerConnection({ iceServers: getIceServers() });
      pcRef.current = pc;

      if (stream) {
        for (const track of stream.getTracks()) {
          pc.addTrack(track, stream);
        }
      } else {
        // Keep m-lines so we can still receive the partner's media.
        pc.addTransceiver("video", { direction: "recvonly" });
        pc.addTransceiver("audio", { direction: "recvonly" });
      }

      pc.ontrack = (event) => {
        const incoming = event.streams[0];
        if (incoming) {
          remoteStreamRef.current = incoming;
          setRemoteStream(incoming);
        } else {
          const remote = remoteStreamRef.current ?? new MediaStream();
          remote.addTrack(event.track);
          remoteStreamRef.current = remote;
          setRemoteStream(remote);
        }
        setPartnerMediaAvailable(true);
        partnerMediaAvailableRef.current = true;
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        const init = event.candidate.toJSON();
        sendRef.current({
          type: "webrtc.signal",
          data: {
            kind: "ice",
            candidate: {
              candidate: init.candidate ?? "",
              sdpMid: init.sdpMid ?? null,
              sdpMLineIndex: init.sdpMLineIndex ?? null,
              usernameFragment: init.usernameFragment ?? null,
            },
          },
        });
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === "connected") {
          clearConnectingTimer();
          const current = statusRef.current;
          if (current !== "permission_denied" && current !== "error") {
            updateStatus("connected");
          }
        } else if (state === "failed") {
          clearConnectingTimer();
          const current = statusRef.current;
          if (current !== "permission_denied") {
            updateStatus("error");
          }
        } else if (state === "disconnected" || state === "closed") {
          // Partner may reconnect briefly; keep last known UI
        }
      };

      if (stream) {
        sendRef.current({
          type: "video.state",
          data: {
            cameraOn: cameraOnRef.current,
            micOn: micOnRef.current,
            available: true,
          },
        });
      } else {
        sendRef.current({
          type: "video.state",
          data: { cameraOn: false, micOn: false, available: false },
        });
      }

      await flushPendingSignals(pc);

      if (initiatorRef.current === true) {
        try {
          makingOfferRef.current = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendRef.current({
            type: "webrtc.signal",
            data: { kind: "offer", sdp: offer.sdp ?? undefined },
          });
        } catch (err) {
          console.error("Failed to create WebRTC offer", err);
          if (!cancelled && statusRef.current !== "permission_denied") {
            updateStatus("error");
          }
        } finally {
          makingOfferRef.current = false;
        }
      }
    }

    async function start() {
      setPartnerCameraOn(true);
      setPartnerMicOn(true);
      partnerMediaAvailableRef.current = true;
      setPartnerMediaAvailable(true);

      let stream: MediaStream | null = streamHasLiveTracks(localStreamRef.current)
        ? localStreamRef.current
        : null;

      // Fallback if Start Chatting did not acquire media (e.g. auto-requeue race).
      if (!stream && statusRef.current !== "permission_denied") {
        updateStatus("requesting");
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (cancelled) {
            for (const track of stream.getTracks()) track.stop();
            return;
          }
          localStreamRef.current = stream;
          setLocalStream(stream);
        } catch (err: any) {
          if (cancelled) return;
          const denied =
            err?.name === "NotAllowedError" ||
            err?.name === "PermissionDeniedError";
          updateStatus(denied ? "permission_denied" : "error");
          setCameraOn(false);
          setMicOn(false);
          cameraOnRef.current = false;
          micOnRef.current = false;
          // Camera is required — do not start a recvonly peer without local media.
          return;
        }
      }

      if (!stream) {
        if (
          statusRef.current !== "permission_denied" &&
          statusRef.current !== "error"
        ) {
          updateStatus("permission_denied");
        }
        return;
      }

      await startPeer(stream);
    }

    start();

    return () => {
      cancelled = true;
      teardownPeer();
    };
  }, [
    enabled,
    roomId,
    initiator,
    teardownPeer,
    flushPendingSignals,
    updateStatus,
    armConnectingTimer,
    clearConnectingTimer,
  ]);

  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !micOn;
    for (const track of stream.getAudioTracks()) {
      track.enabled = next;
    }
    setMicOn(next);
    sendRef.current({
      type: "video.state",
      data: { cameraOn, micOn: next, available: true },
    });
  }, [cameraOn, micOn]);

  return {
    localStream,
    remoteStream,
    status,
    cameraOn,
    micOn,
    partnerCameraOn,
    partnerMicOn,
    partnerMediaAvailable,
    toggleMic,
    ensureLocalMedia,
    releaseLocalMedia,
    teardownVideo: teardown,
  };
}
