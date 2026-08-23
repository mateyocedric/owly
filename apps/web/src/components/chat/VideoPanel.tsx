import React, { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, Loader2 } from "lucide-react";
import type { VideoStatus } from "../../hooks/useWebRTC.js";

const mediaToggleClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-sm border border-[var(--sx-on-primary)] bg-transparent text-[var(--sx-on-primary)] transition-colors hover:bg-[var(--sx-on-primary)] hover:text-[var(--sx-ink)] disabled:pointer-events-none disabled:opacity-40";
interface VideoPanelProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  status: VideoStatus;
  cameraOn: boolean;
  micOn: boolean;
  partnerCameraOn: boolean;
  partnerMicOn: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
}

function VideoTile({
  stream,
  muted,
  mirror,
  label,
  emptyLabel,
  showOffOverlay,
}: {
  stream: MediaStream | null;
  muted?: boolean;
  mirror?: boolean;
  label: string;
  emptyLabel: string;
  showOffOverlay?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-sm border border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night-soft)]">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className={`h-full w-full object-cover ${mirror ? "scale-x-[-1]" : ""} ${
            showOffOverlay ? "opacity-0" : "opacity-100"
          }`}
        />
      ) : null}

      {(!stream || showOffOverlay) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--sx-canvas-night-soft)] text-[var(--sx-on-primary-mute)]">
          <VideoOff className="h-8 w-8 opacity-60" />
          <span className="text-xs font-medium">{emptyLabel}</span>
        </div>
      )}

      <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-zinc-200 backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}

export function VideoPanel({
  localStream,
  remoteStream,
  status,
  cameraOn,
  micOn,
  partnerCameraOn,
  partnerMicOn,
  onToggleCamera,
  onToggleMic,
}: VideoPanelProps) {
  const statusMessage =
    status === "requesting"
      ? "Requesting camera and microphone..."
      : status === "connecting"
        ? "Connecting video..."
        : status === "permission_denied"
          ? "Camera access denied. Text chat still works."
          : status === "error"
            ? "Video connection failed. Text chat still works."
            : null;

  return (
    <div className="shrink-0 space-y-2 border-b border-[var(--sx-hairline-on-dark)] p-3">
      <div className="relative aspect-video max-h-[40vh] w-full overflow-hidden rounded-sm">
        <VideoTile
          stream={remoteStream}
          label={partnerMicOn ? "Stranger" : "Stranger (muted)"}
          emptyLabel={
            status === "connected" && !partnerCameraOn
              ? "Stranger camera off"
              : statusMessage || "Waiting for stranger video..."
          }
          showOffOverlay={status === "connected" && !partnerCameraOn}
        />

        <div className="absolute bottom-3 right-3 h-[28%] w-[28%] min-w-[100px] min-h-[72px] max-w-[180px] shadow-xl">
          <VideoTile
            stream={localStream}
            muted
            mirror
            label="You"
            emptyLabel={
              status === "permission_denied"
                ? "Camera blocked"
                : cameraOn
                  ? "Starting camera..."
                  : "Camera off"
            }
            showOffOverlay={!!localStream && !cameraOn}
          />
        </div>

        {(status === "requesting" || status === "connecting") && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-zinc-200 backdrop-blur-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {statusMessage}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[11px] text-[var(--sx-on-primary-mute)]">
          {status === "permission_denied" || status === "error"
            ? statusMessage
            : status === "connected"
              ? "Live video connected"
              : "Setting up live video..."}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={mediaToggleClass}
            onClick={onToggleMic}
            disabled={!localStream}
            aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
          >
            {micOn ? <Mic className="size-3.5" /> : <MicOff className="size-3.5" />}
          </button>
          <button
            type="button"
            className={mediaToggleClass}
            onClick={onToggleCamera}
            disabled={!localStream}
            aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
          >
            {cameraOn ? <Video className="size-3.5" /> : <VideoOff className="size-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
