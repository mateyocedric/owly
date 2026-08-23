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

function getIceServers(): RTCIceServer[] {
  const stun =
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env?.VITE_STUN_URL) ||
    DEFAULT_STUN;
  return [{ urls: stun }];
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

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingSignalsRef = useRef<SignalData[]>([]);
  const makingOfferRef = useRef(false);
  const roomIdRef = useRef(roomId);
  const initiatorRef = useRef(initiator);
  const sendRef = useRef(send);

  roomIdRef.current = roomId;
  initiatorRef.current = initiator;
  sendRef.current = send;

  const teardown = useCallback(() => {
    pendingSignalsRef.current = [];
    makingOfferRef.current = false;

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

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        track.stop();
      }
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      for (const track of remoteStreamRef.current.getTracks()) {
        track.stop();
      }
      remoteStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
    setStatus("idle");
    setCameraOn(true);
    setMicOn(true);
    setPartnerCameraOn(true);
    setPartnerMicOn(true);
  }, []);

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

  const handleInboundVideoState = useCallback((data: VideoStateData) => {
    setPartnerCameraOn(data.cameraOn);
    setPartnerMicOn(data.micOn);
  }, []);

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
    if (!enabled || !roomId || initiator === null) {
      teardown();
      return;
    }

    let cancelled = false;

    async function start() {
      setStatus("requesting");
      setPartnerCameraOn(true);
      setPartnerMicOn(true);

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } catch (err: any) {
        if (cancelled) return;
        const denied =
          err?.name === "NotAllowedError" ||
          err?.name === "PermissionDeniedError";
        setStatus(denied ? "permission_denied" : "error");
        return;
      }

      if (cancelled) {
        for (const track of stream.getTracks()) track.stop();
        return;
      }

      localStreamRef.current = stream;
      setLocalStream(stream);
      setCameraOn(true);
      setMicOn(true);
      setStatus("connecting");

      const pc = new RTCPeerConnection({ iceServers: getIceServers() });
      pcRef.current = pc;

      for (const track of stream.getTracks()) {
        pc.addTrack(track, stream);
      }

      pc.ontrack = (event) => {
        const incoming = event.streams[0];
        if (incoming) {
          remoteStreamRef.current = incoming;
          setRemoteStream(incoming);
          return;
        }
        const remote = remoteStreamRef.current ?? new MediaStream();
        remote.addTrack(event.track);
        remoteStreamRef.current = remote;
        setRemoteStream(remote);
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
          setStatus("connected");
        } else if (state === "failed") {
          setStatus("error");
        } else if (state === "disconnected" || state === "closed") {
          // Partner may reconnect briefly; keep last known UI
        }
      };

      // Announce initial AV state to partner
      sendRef.current({
        type: "video.state",
        data: { cameraOn: true, micOn: true },
      });

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
          if (!cancelled) setStatus("error");
        } finally {
          makingOfferRef.current = false;
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [enabled, roomId, initiator, teardown, flushPendingSignals]);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const next = !cameraOn;
    for (const track of stream.getVideoTracks()) {
      track.enabled = next;
    }
    setCameraOn(next);
    sendRef.current({
      type: "video.state",
      data: { cameraOn: next, micOn },
    });
  }, [cameraOn, micOn]);

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
      data: { cameraOn, micOn: next },
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
    toggleCamera,
    toggleMic,
    teardownVideo: teardown,
  };
}
