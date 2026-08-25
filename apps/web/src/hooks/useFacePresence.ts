import { useEffect, useRef, useState } from "react";
import { FACE_PRESENCE } from "@owly/shared";
import {
  createFaceDetector,
  type FacePresenceDetector,
} from "../lib/face-detector.js";

export interface UseFacePresenceOptions {
  enabled: boolean;
  stream: MediaStream | null;
  onTimeout: () => void;
}

export interface FacePresenceState {
  warning: boolean;
  secondsLeft: number;
}

/**
 * Monitor the local camera for a visible face during an active session.
 * Starts a grace-period warning after consecutive misses; ends the session
 * via onTimeout if the face does not return before ABSENCE_TIMEOUT_SECONDS.
 */
export function useFacePresence({
  enabled,
  stream,
  onTimeout,
}: UseFacePresenceOptions): FacePresenceState {
  const [warning, setWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const missStreakRef = useRef(0);
  const inFlightRef = useRef(false);
  const warningActiveRef = useRef(false);
  const absenceTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const absenceDeadlineRef = useRef(0);

  useEffect(() => {
    if (!enabled || !stream) {
      missStreakRef.current = 0;
      warningActiveRef.current = false;
      if (absenceTimerRef.current) {
        clearTimeout(absenceTimerRef.current);
        absenceTimerRef.current = null;
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setWarning(false);
      setSecondsLeft(0);
      return;
    }

    const activeStream = stream;
    let cancelled = false;
    let detector: FacePresenceDetector | null = null;
    let intervalId: number | null = null;
    let video: HTMLVideoElement | null = null;

    const clearAbsenceTimers = () => {
      if (absenceTimerRef.current) {
        clearTimeout(absenceTimerRef.current);
        absenceTimerRef.current = null;
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };

    const clearWarning = () => {
      missStreakRef.current = 0;
      if (!warningActiveRef.current) return;
      warningActiveRef.current = false;
      clearAbsenceTimers();
      setWarning(false);
      setSecondsLeft(0);
    };

    const startWarning = () => {
      if (warningActiveRef.current || cancelled) return;
      warningActiveRef.current = true;

      const timeoutMs = FACE_PRESENCE.ABSENCE_TIMEOUT_SECONDS * 1000;
      absenceDeadlineRef.current = Date.now() + timeoutMs;
      setWarning(true);
      setSecondsLeft(FACE_PRESENCE.ABSENCE_TIMEOUT_SECONDS);

      absenceTimerRef.current = window.setTimeout(() => {
        absenceTimerRef.current = null;
        if (cancelled) return;
        warningActiveRef.current = false;
        clearAbsenceTimers();
        setWarning(false);
        setSecondsLeft(0);
        onTimeoutRef.current();
      }, timeoutMs);

      countdownTimerRef.current = window.setInterval(() => {
        if (cancelled) return;
        const remaining = Math.max(
          0,
          Math.ceil((absenceDeadlineRef.current - Date.now()) / 1000)
        );
        setSecondsLeft((prev) => (prev === remaining ? prev : remaining));
      }, 1000);
    };

    const runDetect = async () => {
      if (cancelled || inFlightRef.current || !detector || !video) return;

      const hasLiveVideo = activeStream
        .getVideoTracks()
        .some((t) => t.readyState === "live" && t.enabled);

      if (!hasLiveVideo) {
        missStreakRef.current += 1;
        if (
          missStreakRef.current >= FACE_PRESENCE.MISS_STREAK_BEFORE_WARNING
        ) {
          startWarning();
        }
        return;
      }

      if (video.readyState < 2 || video.videoWidth === 0) return;

      inFlightRef.current = true;
      try {
        const present = await detector.detect(video);
        if (cancelled) return;

        if (present) {
          clearWarning();
        } else {
          missStreakRef.current += 1;
          if (
            missStreakRef.current >= FACE_PRESENCE.MISS_STREAK_BEFORE_WARNING
          ) {
            startWarning();
          }
        }
      } finally {
        inFlightRef.current = false;
      }
    };

    async function start() {
      video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "true");
      video.style.position = "fixed";
      video.style.width = "1px";
      video.style.height = "1px";
      video.style.opacity = "0";
      video.style.pointerEvents = "none";
      video.style.left = "-9999px";
      document.body.appendChild(video);
      video.srcObject = activeStream;
      try {
        await video.play();
      } catch {
        // Autoplay may fail silently; readyState still advances with srcObject.
      }

      try {
        detector = await createFaceDetector();
      } catch (err) {
        console.error("Failed to create face detector", err);
        return;
      }
      if (cancelled) {
        detector.close();
        detector = null;
        return;
      }

      // Warm up: ignore early black / settling frames.
      await new Promise((r) => setTimeout(r, FACE_PRESENCE.WARMUP_MS));
      if (cancelled) return;

      intervalId = window.setInterval(
        () => void runDetect(),
        FACE_PRESENCE.DETECTION_INTERVAL_MS
      );
      void runDetect();
    }

    void start();

    return () => {
      cancelled = true;
      clearAbsenceTimers();
      warningActiveRef.current = false;
      missStreakRef.current = 0;
      inFlightRef.current = false;
      if (intervalId !== null) clearInterval(intervalId);
      if (detector) {
        detector.close();
        detector = null;
      }
      if (video) {
        video.pause();
        video.srcObject = null;
        video.remove();
        video = null;
      }
      setWarning(false);
      setSecondsLeft(0);
    };
  }, [enabled, stream]);

  return { warning, secondsLeft };
}
