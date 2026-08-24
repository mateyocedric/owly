import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Loader2 } from "lucide-react";
import type { ChatReactionEmoji } from "@owly/shared";
import type { VideoStatus } from "../../hooks/useWebRTC.js";
import { ViewSwitcher, type VideoPrimaryView } from "./ViewSwitcher.js";
import { ReactionBar } from "./ReactionBar.js";
import {
  ReactionBurstOverlay,
  type ReactionBurst,
} from "./ReactionBurstOverlay.js";

const mediaToggleClass =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-sm border border-white/30 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:pointer-events-none disabled:opacity-40";

const pipClass =
  "absolute right-3 top-[7.25rem] z-10 aspect-video cursor-pointer overflow-hidden shadow-xl transition-[width,height,max-width] duration-200 lg:bottom-3 lg:right-3 lg:top-auto";

const pipCollapsedClass = "w-28 sm:w-32 lg:h-[22%] lg:w-[28%] lg:min-h-[72px] lg:min-w-[100px] lg:max-w-[180px] lg:aspect-auto";

const pipExpandedClass =
  "w-[min(18rem,70vw)] sm:w-72 lg:h-[42%] lg:w-[42%] lg:min-h-[140px] lg:min-w-[200px] lg:max-w-[320px] lg:aspect-auto";

const primaryClass = "absolute inset-0";

interface VideoPanelProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  status: VideoStatus;
  cameraOn: boolean;
  micOn: boolean;
  partnerCameraOn: boolean;
  partnerMicOn: boolean;
  partnerMediaAvailable?: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  remoteEmptyLabel?: string;
  reactionsEnabled?: boolean;
  reactionBursts?: ReactionBurst[];
  onSendReaction?: (emoji: ChatReactionEmoji) => void;
  onReactionBurstEnd?: (id: string) => void;
}

const VideoTile = memo(function VideoTile({
  stream,
  muted,
  mirror,
  label,
  emptyLabel,
  showOffOverlay,
  framed = false,
  switcher,
}: {
  stream: MediaStream | null;
  muted?: boolean;
  mirror?: boolean;
  label: string;
  emptyLabel: string;
  showOffOverlay?: boolean;
  framed?: boolean;
  switcher?: React.ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.srcObject !== stream) {
      el.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-[var(--sx-canvas-night-soft)] ${
        framed ? "rounded-sm border border-[var(--sx-hairline-on-dark)]" : ""
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`h-full w-full object-cover ${mirror ? "scale-x-[-1]" : ""} ${
          stream && !showOffOverlay ? "opacity-100" : "opacity-0"
        }`}
      />

      {(!stream || showOffOverlay) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[var(--sx-canvas-night-soft)] px-1 text-center text-[var(--sx-on-primary-mute)] lg:gap-2">
          <VideoOff className={`opacity-60 ${framed ? "h-5 w-5" : "h-8 w-8"}`} />
          <span className={`font-medium leading-tight ${framed ? "text-[10px]" : "text-xs"}`}>
            {emptyLabel}
          </span>
        </div>
      )}

      <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-zinc-200 backdrop-blur-sm">
        {label}
      </span>

      {switcher ? <div className="absolute right-1 top-1 z-10">{switcher}</div> : null}
    </div>
  );
});

export const VideoPanel = memo(function VideoPanel({
  localStream,
  remoteStream,
  status,
  cameraOn,
  micOn,
  partnerCameraOn,
  partnerMicOn,
  partnerMediaAvailable = true,
  onToggleCamera,
  onToggleMic,
  remoteEmptyLabel,
  reactionsEnabled = false,
  reactionBursts = [],
  onSendReaction,
  onReactionBurstEnd,
}: VideoPanelProps) {
  const [primaryView, setPrimaryView] = useState<VideoPrimaryView>("remote");
  const [pipExpanded, setPipExpanded] = useState(false);
  const selfPrimary = primaryView === "self";

  const switchView = useCallback(() => {
    setPrimaryView((current) => (current === "remote" ? "self" : "remote"));
    setPipExpanded(false);
  }, []);

  const togglePipSize = useCallback(() => {
    setPipExpanded((open) => !open);
  }, []);

  const handleReact = useCallback(
    (emoji: ChatReactionEmoji) => {
      onSendReaction?.(emoji);
    },
    [onSendReaction]
  );

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
    <div className="relative h-full w-full">
      <div
        className={`${selfPrimary ? pipClass : primaryClass} ${
          selfPrimary ? (pipExpanded ? pipExpandedClass : pipCollapsedClass) : ""
        }`}
        onClick={selfPrimary ? togglePipSize : undefined}
      >
        <VideoTile
          stream={remoteStream}
          label={partnerMicOn ? "Stranger" : "Stranger (muted)"}
          emptyLabel={
            remoteEmptyLabel
              ? remoteEmptyLabel
              : !partnerMediaAvailable
                ? "Stranger camera unavailable"
                : status === "connected" && !partnerCameraOn
                  ? "Stranger camera off"
                  : statusMessage || "Waiting for stranger video..."
          }
          showOffOverlay={
            !!remoteEmptyLabel ||
            !partnerMediaAvailable ||
            (status === "connected" && !partnerCameraOn)
          }
          framed={selfPrimary}
          switcher={selfPrimary ? <ViewSwitcher primaryView={primaryView} onSwitch={switchView} /> : undefined}
        />
      </div>

      <div
        className={`${selfPrimary ? primaryClass : pipClass} ${
          !selfPrimary ? (pipExpanded ? pipExpandedClass : pipCollapsedClass) : ""
        }`}
        onClick={!selfPrimary ? togglePipSize : undefined}
      >
        <VideoTile
          stream={localStream}
          muted
          mirror
          framed={!selfPrimary}
          label="You"
          emptyLabel={
            status === "permission_denied"
              ? "Camera blocked"
              : cameraOn
                ? "Starting camera..."
                : "Camera off"
          }
          showOffOverlay={!!localStream && !cameraOn}
          switcher={!selfPrimary ? <ViewSwitcher primaryView={primaryView} onSwitch={switchView} /> : undefined}
        />
      </div>

      <ReactionBurstOverlay
        bursts={reactionBursts}
        onBurstEnd={onReactionBurstEnd ?? (() => {})}
      />

      <div className="absolute left-3 top-[7.25rem] z-10 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 lg:bottom-3 lg:top-auto">
        <button
          type="button"
          className={mediaToggleClass}
          onClick={onToggleMic}
          disabled={!localStream}
          aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
        >
          {micOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
        </button>
        <button
          type="button"
          className={mediaToggleClass}
          onClick={onToggleCamera}
          disabled={!localStream}
          aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
        >
          {cameraOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
        </button>
        {onSendReaction ? (
          <ReactionBar disabled={!reactionsEnabled} onReact={handleReact} />
        ) : null}
      </div>

      {(status === "requesting" || status === "connecting") && partnerMediaAvailable && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/20">
          <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs text-zinc-200 backdrop-blur-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {statusMessage}
          </div>
        </div>
      )}

      {(status === "permission_denied" || status === "error") && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/20 pb-[45%] lg:pb-0">
          <div className="max-w-[min(18rem,calc(100%-1.5rem))] rounded-full bg-black/60 px-4 py-1.5 text-center text-xs text-zinc-200 backdrop-blur-sm">
            {statusMessage}
          </div>
        </div>
      )}
    </div>
  );
});
