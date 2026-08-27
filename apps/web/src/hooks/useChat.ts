import { useEffect, useRef, useCallback, useState } from "react";
import {
  CHAT_REACTION_BY_ID,
  DEVICE_SESSION,
  MATCHMAKING,
  RATE_LIMITS,
  WS_CLOSE,
  type ChatMode,
} from "@owly/shared";
import type { ChatReactionId, ClientEvent } from "@owly/shared";
import { toast } from "sonner";
import { useAppStore, type UserSession } from "../lib/store.js";
import { isDeviceSessionActiveError, OwlyWSClient } from "../lib/ws-client.js";
import {
  publishDeviceSession,
  subscribeDeviceSessionChannel,
} from "../lib/device-session-channel.js";
import { apiFetch } from "../lib/api.js";
import { nanoid } from "nanoid";
import {
  useWebRTC,
  type WebrtcInboundHandlers,
} from "./useWebRTC.js";
import { useFacePresence } from "./useFacePresence.js";
import type { ReactionBurst } from "../components/chat/ReactionBurstOverlay.js";

function createReactionBurst(
  reactionId: ChatReactionId,
  from: "self" | "partner"
): ReactionBurst {
  // Self bursts lean left; partner bursts lean right, with light random drift.
  const xBase = from === "self" ? 28 : 72;
  const x = Math.min(88, Math.max(12, xBase + (Math.random() * 16 - 8)));
  const drift = (Math.random() * 48 - 24) * (from === "self" ? 1 : -1);
  return {
    id: nanoid(),
    emoji: CHAT_REACTION_BY_ID[reactionId].emoji,
    from,
    x,
    drift,
  };
}

/** Serialize POST /session so Strict Mode / double mount cannot mint two sessions. */
let ensureSessionInFlight: Promise<UserSession> | null = null;

async function ensureAnonymousSession(): Promise<UserSession> {
  const store = useAppStore.getState();
  const existing = store.session;
  const expired =
    !!existing?.expiresAt && new Date(existing.expiresAt).getTime() <= Date.now();
  if (existing?.token && !expired) {
    return existing;
  }

  if (ensureSessionInFlight) {
    return ensureSessionInFlight;
  }

  ensureSessionInFlight = (async () => {
    const again = useAppStore.getState().session;
    const againExpired =
      !!again?.expiresAt && new Date(again.expiresAt).getTime() <= Date.now();
    if (again?.token && !againExpired) {
      return again;
    }

    const created = await apiFetch<{
      sessionId: string;
      token: string;
      expiresAt: string;
    }>("/session", {
      method: "POST",
      body: JSON.stringify({
        interests: useAppStore.getState().interests || [],
        gender: useAppStore.getState().gender || undefined,
      }),
    });

    const session: UserSession = {
      sessionId: created.sessionId,
      token: created.token,
      expiresAt: created.expiresAt,
      ageVerified: true,
      interests: useAppStore.getState().interests || [],
      gender: useAppStore.getState().gender,
    };
    useAppStore.getState().setSession(session);
    return session;
  })().finally(() => {
    ensureSessionInFlight = null;
  });

  return ensureSessionInFlight;
}

export function useChat(options: { mode: ChatMode }) {
  const mode = options.mode;
  const isVideo = mode === "video";
  const store = useAppStore();
  const wsClientRef = useRef<OwlyWSClient | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const autoQueueTimerRef = useRef<number | null>(null);
  const cooldownTimerRef = useRef<number | null>(null);
  const cooldownEndRef = useRef(0);
  const lastOutgoingIdRef = useRef<string | null>(null);
  const webrtcHandlersRef = useRef<WebrtcInboundHandlers | null>(null);
  const lastReactionTimeRef = useRef(0);
  const recentReactionTimesRef = useRef<number[]>([]);
  const joinQueueRef = useRef<(interests?: string[]) => Promise<void>>(
    async () => {}
  );
  const joiningRef = useRef(false);
  const holdingDeviceClaimRef = useRef(false);
  const reconnectSoonRef = useRef<number | null>(null);
  const findingReconnectsRef = useRef(0);
  const autoRequeueCountRef = useRef(0);
  const [sendCooldownSeconds, setSendCooldownSeconds] = useState(0);
  const [webrtcInitiator, setWebrtcInitiator] = useState<boolean | null>(null);
  const [reactionBursts, setReactionBursts] = useState<ReactionBurst[]>([]);

  const clearReactionBursts = useCallback(() => {
    setReactionBursts([]);
  }, []);

  const pushReactionBurst = useCallback(
    (reactionId: ChatReactionId, from: "self" | "partner") => {
      setReactionBursts((prev) => [...prev, createReactionBurst(reactionId, from)]);
    },
    []
  );

  const removeReactionBurst = useCallback((id: string) => {
    setReactionBursts((prev) => prev.filter((burst) => burst.id !== id));
  }, []);

  const sendClientEvent = useCallback((event: ClientEvent) => {
    wsClientRef.current?.send(event);
  }, []);

  const videoEnabled =
    isVideo &&
    store.connectionState === "connected" &&
    !!store.roomId &&
    webrtcInitiator !== null;

  const video = useWebRTC({
    enabled: videoEnabled,
    roomId: store.roomId,
    initiator: webrtcInitiator,
    send: sendClientEvent,
    handlersRef: webrtcHandlersRef,
  });

  const ensureLocalMediaRef = useRef(video.ensureLocalMedia);
  const releaseLocalMediaRef = useRef(video.releaseLocalMedia);
  const stopChatRef = useRef<() => void>(() => {});
  ensureLocalMediaRef.current = video.ensureLocalMedia;
  releaseLocalMediaRef.current = video.releaseLocalMedia;

  const facePresence = useFacePresence({
    enabled:
      isVideo && store.connectionState === "connected" && !!store.roomId,
    stream: video.localStream,
    onTimeout: () => {
      toast.error("Session ended because no face was detected.");
      stopChatRef.current();
    },
  });

  const clearAutoQueueTimer = useCallback(() => {
    if (autoQueueTimerRef.current) {
      clearTimeout(autoQueueTimerRef.current);
      autoQueueTimerRef.current = null;
    }
  }, []);

  const clearReconnectSoon = useCallback(() => {
    if (reconnectSoonRef.current) {
      clearTimeout(reconnectSoonRef.current);
      reconnectSoonRef.current = null;
    }
  }, []);

  const markQueueSettled = useCallback(() => {
    joiningRef.current = false;
    findingReconnectsRef.current = 0;
    autoRequeueCountRef.current = 0;
    clearReconnectSoon();
  }, [clearReconnectSoon]);

  const markDeviceClaimed = useCallback(() => {
    holdingDeviceClaimRef.current = true;
    publishDeviceSession("claimed");
  }, []);

  const markDeviceReleased = useCallback(() => {
    if (!holdingDeviceClaimRef.current) return;
    holdingDeviceClaimRef.current = false;
    publishDeviceSession("released");
  }, []);

  const showDeviceSessionBlocked = useCallback(() => {
    markQueueSettled();
    setWebrtcInitiator(null);
    store.setRoomId(null);
    store.setConnectionState("error", DEVICE_SESSION.ACTIVE_MESSAGE);
    releaseLocalMediaRef.current();
  }, [markQueueSettled, store]);

  const scheduleAutoQueue = useCallback(
    (message: string) => {
      autoRequeueCountRef.current += 1;
      if (autoRequeueCountRef.current > MATCHMAKING.MAX_AUTO_REQUEUES) {
        joiningRef.current = false;
        markDeviceReleased();
        useAppStore.getState().setConnectionState("idle");
        wsClientRef.current?.disconnect();
        return;
      }
      useAppStore.getState().addMessage({
        id: nanoid(),
        sender: "system",
        content: message,
        timestamp: new Date(),
      });
      clearAutoQueueTimer();
      autoQueueTimerRef.current = window.setTimeout(() => {
        autoQueueTimerRef.current = null;
        void joinQueueRef.current();
      }, 2000);
    },
    [clearAutoQueueTimer, markDeviceReleased]
  );

  const clearSendCooldown = useCallback(() => {
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
    cooldownEndRef.current = 0;
    setSendCooldownSeconds(0);
  }, []);

  const startSendCooldown = useCallback((seconds?: number) => {
    const duration = Math.max(
      1,
      seconds ?? RATE_LIMITS.MESSAGE_COOLDOWN_SECONDS
    );
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
    cooldownEndRef.current = Date.now() + duration * 1000;
    setSendCooldownSeconds(duration);

    cooldownTimerRef.current = window.setInterval(() => {
      const remaining = Math.ceil((cooldownEndRef.current - Date.now()) / 1000);
      if (remaining <= 0) {
        if (cooldownTimerRef.current) {
          clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
        }
        cooldownEndRef.current = 0;
        setSendCooldownSeconds(0);
        return;
      }
      setSendCooldownSeconds(remaining);
    }, 250);
  }, []);

  // Initialize or connect WebSocket
  const initWS = useCallback(async () => {
    let session: UserSession;
    try {
      session = await ensureAnonymousSession();
    } catch (err) {
      console.error("Failed to establish session:", err);
      store.setConnectionState(
        "error",
        err instanceof Error ? err.message : "Failed to create session"
      );
      return null;
    }

    if (!wsClientRef.current) {
      wsClientRef.current = new OwlyWSClient(session.token);

      wsClientRef.current.onClose((code) => {
        const { connectionState } = useAppStore.getState();
        setWebrtcInitiator(null);
        store.setRoomId(null);

        if (code === WS_CLOSE.DEVICE_SESSION_ACTIVE) {
          showDeviceSessionBlocked();
          return;
        }

        if (code === WS_CLOSE.EMPTY_MATCH_LIMIT) {
          markDeviceReleased();
          markQueueSettled();
          store.setConnectionState("idle");
          releaseLocalMediaRef.current();
          return;
        }

        if (code === WS_CLOSE.REPLACED) {
          // Another socket for this session took over; it still owns the lock.
          holdingDeviceClaimRef.current = false;
          markQueueSettled();
          store.setConnectionState("idle");
          releaseLocalMediaRef.current();
          return;
        }

        if (connectionState === "finding" || joiningRef.current) {
          store.setConnectionState("finding");
          findingReconnectsRef.current += 1;
          if (findingReconnectsRef.current > MATCHMAKING.MAX_AUTO_REQUEUES) {
            joiningRef.current = false;
            markDeviceReleased();
            store.setConnectionState("error");
            return;
          }
          if (!reconnectSoonRef.current) {
            reconnectSoonRef.current = window.setTimeout(() => {
              reconnectSoonRef.current = null;
              void joinQueueRef.current();
            }, 100);
          }
          return;
        }

        if (connectionState === "connected") {
          store.setConnectionState("disconnected");
          scheduleAutoQueue(
            "Connection lost. Rejoining the queue in 2 seconds..."
          );
        }
      });

      wsClientRef.current.on((event) => {
        switch (event.type) {
          case "queue.waiting":
            markQueueSettled();
            setWebrtcInitiator(null);
            store.setConnectionState("finding");
            store.setQueuePosition(event.data.position ?? 1);
            break;

          case "match.found":
            markQueueSettled();
            clearAutoQueueTimer();
            clearSendCooldown();
            clearReactionBursts();
            lastOutgoingIdRef.current = null;
            lastReactionTimeRef.current = 0;
            recentReactionTimesRef.current = [];
            setWebrtcInitiator(event.data.initiator);
            store.setConnectionState("connected");
            store.setRoomId(
              event.data.roomId,
              event.data.commonInterests,
              event.data.partnerGender ?? null
            );
            store.clearMessages();
            store.addMessage({
              id: nanoid(),
              sender: "system",
              content: event.data.commonInterests?.length
                ? `Matched with someone who shares interest in: ${event.data.commonInterests.join(", ")}`
                : "You are now chatting with a random stranger. Say hi!",
              timestamp: new Date(),
            });
            break;

          case "chat.message":
            store.addMessage({
              id: nanoid(),
              sender: "partner",
              content: event.data.content,
              timestamp: new Date(event.data.timestamp),
            });
            break;

          case "chat.typing":
            store.setPartnerTyping(true);
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
            typingTimerRef.current = window.setTimeout(() => {
              store.setPartnerTyping(false);
            }, 3000);
            break;

          case "chat.reaction":
            pushReactionBurst(event.data.id, "partner");
            break;

          case "chat.partner_left":
            clearReactionBursts();
            setWebrtcInitiator(null);
            store.setRoomId(null);
            store.setConnectionState("partner_left");
            store.addMessage({
              id: nanoid(),
              sender: "system",
              content:
                "Stranger has disconnected. Click Next to find a new partner.",
              timestamp: new Date(),
            });
            break;

          case "chat.ended":
            markQueueSettled();
            clearAutoQueueTimer();
            clearReactionBursts();
            setWebrtcInitiator(null);
            store.setRoomId(null);
            store.setConnectionState("idle");
            releaseLocalMediaRef.current();
            break;

          case "moderation.warning":
            store.setModerationWarning(event.data.message);
            store.addMessage({
              id: nanoid(),
              sender: "system",
              content: `⚠️ Warning: ${event.data.message}`,
              timestamp: new Date(),
            });
            break;

          case "webrtc.signal":
            if (isVideo) {
              webrtcHandlersRef.current?.onSignal(event.data);
            }
            break;

          case "video.state":
            if (isVideo) {
              webrtcHandlersRef.current?.onVideoState(event.data);
            }
            break;

          case "error":
            if (event.data.code === "RATE_LIMITED") {
              if (lastOutgoingIdRef.current) {
                store.removeMessage(lastOutgoingIdRef.current);
                lastOutgoingIdRef.current = null;
              }
              startSendCooldown(
                event.data.retryAfterSeconds ?? RATE_LIMITS.MESSAGE_COOLDOWN_SECONDS
              );
            }
            // Older APIs reject unknown events (e.g. chat.reaction) with this code.
            if (event.data.code === "INVALID_EVENT") {
              break;
            }
            if (event.data.code === "SKIP_COOLDOWN") {
              joiningRef.current = false;
              const { connectionState, roomId } = useAppStore.getState();
              if (connectionState === "finding" && !roomId) {
                store.setConnectionState("idle");
              }
            }
            if (event.data.code === "EMPTY_MATCH_LIMIT") {
              markDeviceReleased();
              markQueueSettled();
              store.setConnectionState("idle");
              releaseLocalMediaRef.current();
            }
            if (event.data.code === DEVICE_SESSION.ACTIVE_ERROR_CODE) {
              showDeviceSessionBlocked();
              break;
            }
            store.addMessage({
              id: nanoid(),
              sender: "system",
              content: `Error: ${event.data.message}`,
              timestamp: new Date(),
            });
            break;
        }
      });
    }

    try {
      await wsClientRef.current.connect();
      markDeviceClaimed();
    } catch (err) {
      if (isDeviceSessionActiveError(err)) {
        wsClientRef.current.disconnect();
        wsClientRef.current = null;
        showDeviceSessionBlocked();
        return null;
      }
      console.error("Failed to connect WebSocket:", err);
      wsClientRef.current.disconnect();
      wsClientRef.current = null;
      setWebrtcInitiator(null);
      store.setSession(null);
      store.setConnectionState("error");
      return null;
    }
    return wsClientRef.current;
  }, [
    store,
    isVideo,
    scheduleAutoQueue,
    markQueueSettled,
    markDeviceClaimed,
    markDeviceReleased,
    showDeviceSessionBlocked,
    clearAutoQueueTimer,
    clearSendCooldown,
    clearReactionBursts,
    pushReactionBurst,
    startSendCooldown,
  ]);

  const joinQueue = useCallback(
    async (interests?: string[]) => {
      joiningRef.current = true;
      try {
        clearAutoQueueTimer();
        clearReconnectSoon();
        store.setConnectionState("finding");
        if (isVideo) {
          // Request camera/mic on the user gesture before any network await.
          const media = await ensureLocalMediaRef.current();
          if (!media) {
            joiningRef.current = false;
            store.setConnectionState(
              "error",
              "Camera access is required to start a video chat."
            );
            return;
          }
        }
        store.setConnectionState("finding");
        const client = await initWS();
        if (!client) {
          joiningRef.current = false;
          return;
        }

        setWebrtcInitiator(null);
        store.setRoomId(null);
        store.setConnectionState("finding");
        store.clearMessages();
        client.send({
          type: "queue.join",
          data: {
            interests: interests || store.interests,
            gender: store.gender || undefined,
            mode,
          },
        });
      } catch (err) {
        console.error("Failed to join queue:", err);
        joiningRef.current = false;
        store.setConnectionState("error");
      }
    },
    [initWS, store, clearAutoQueueTimer, clearReconnectSoon, isVideo, mode]
  );

  joinQueueRef.current = joinQueue;

  const sendMessage = useCallback(
    (content: string) => {
      if (!wsClientRef.current || !content.trim()) return;
      if (cooldownEndRef.current > Date.now()) return;

      const id = nanoid();
      lastOutgoingIdRef.current = id;

      wsClientRef.current.send({
        type: "chat.message",
        data: { content: content.trim() },
      });

      store.addMessage({
        id,
        sender: "self",
        content: content.trim(),
        timestamp: new Date(),
      });
    },
    [store]
  );

  const sendTyping = useCallback(() => {
    if (!wsClientRef.current) return;
    wsClientRef.current.send({ type: "chat.typing" });
  }, []);

  const sendReaction = useCallback(
    (reactionId: ChatReactionId) => {
      if (!wsClientRef.current) return;
      if (useAppStore.getState().connectionState !== "connected") return;

      const now = Date.now();
      const recent = recentReactionTimesRef.current.filter(
        (t) => now - t < RATE_LIMITS.REACTION_BURST_WINDOW_MS
      );
      const tooFast =
        now - lastReactionTimeRef.current < RATE_LIMITS.REACTION_MIN_INTERVAL_MS;
      const bursting = recent.length >= RATE_LIMITS.REACTION_BURST_LIMIT;
      if (tooFast || bursting) return;

      lastReactionTimeRef.current = now;
      recent.push(now);
      recentReactionTimesRef.current = recent;

      pushReactionBurst(reactionId, "self");
      wsClientRef.current.send({
        type: "chat.reaction",
        data: { id: reactionId },
      });
    },
    [pushReactionBurst]
  );

  const nextChat = useCallback(() => {
    if (!wsClientRef.current) {
      void joinQueue();
      return;
    }
    joiningRef.current = true;
    clearReconnectSoon();
    clearAutoQueueTimer();
    clearSendCooldown();
    lastOutgoingIdRef.current = null;
    setWebrtcInitiator(null);
    store.setRoomId(null);
    store.setConnectionState("finding");
    store.clearMessages();
    wsClientRef.current.send({ type: "chat.next" });
  }, [store, joinQueue, clearAutoQueueTimer, clearReconnectSoon, clearSendCooldown]);

  const stopChat = useCallback(() => {
    if (!wsClientRef.current) {
      setWebrtcInitiator(null);
      releaseLocalMediaRef.current();
      useAppStore.getState().resetChat();
      return;
    }
    joiningRef.current = false;
    clearReconnectSoon();
    clearAutoQueueTimer();
    clearSendCooldown();
    lastOutgoingIdRef.current = null;
    setWebrtcInitiator(null);
    wsClientRef.current.send({ type: "chat.stop" });
    wsClientRef.current.disconnect();
    markDeviceReleased();
    store.setRoomId(null);
    store.setConnectionState("idle");
    releaseLocalMediaRef.current();
  }, [store, clearAutoQueueTimer, clearReconnectSoon, clearSendCooldown, markDeviceReleased]);

  stopChatRef.current = stopChat;

  const blockPartner = useCallback(() => {
    if (!wsClientRef.current) return;
    clearAutoQueueTimer();
    setWebrtcInitiator(null);
    wsClientRef.current.send({ type: "chat.block" });
    store.setRoomId(null);
    store.setConnectionState("idle");
    releaseLocalMediaRef.current();
    store.addMessage({
      id: nanoid(),
      sender: "system",
      content: "User blocked. You will not be matched with them again.",
      timestamp: new Date(),
    });
  }, [store, clearAutoQueueTimer]);

  const reportPartner = useCallback(
    (category: any, description?: string) => {
      if (!wsClientRef.current) return;
      clearAutoQueueTimer();
      setWebrtcInitiator(null);
      wsClientRef.current.send({
        type: "chat.report",
        data: { category, description },
      });
      store.setRoomId(null);
      store.setConnectionState("idle");
      releaseLocalMediaRef.current();
      store.addMessage({
        id: nanoid(),
        sender: "system",
        content: "Report submitted. Thank you for keeping Owly safe.",
        timestamp: new Date(),
      });
    },
    [store, clearAutoQueueTimer]
  );

  useEffect(() => {
    return subscribeDeviceSessionChannel((message) => {
      if (message.type === "claimed") {
        if (holdingDeviceClaimRef.current) return;
        const state = useAppStore.getState().connectionState;
        if (state === "finding" || state === "connected") return;
        useAppStore
          .getState()
          .setConnectionState("error", DEVICE_SESSION.ACTIVE_MESSAGE);
        return;
      }
      if (message.type === "released") {
        const { connectionState, connectionError } = useAppStore.getState();
        if (
          connectionState === "error" &&
          connectionError === DEVICE_SESSION.ACTIVE_MESSAGE
        ) {
          useAppStore.getState().setConnectionState("idle");
        }
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (autoQueueTimerRef.current) clearTimeout(autoQueueTimerRef.current);
      if (reconnectSoonRef.current) clearTimeout(reconnectSoonRef.current);
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      joiningRef.current = false;
      findingReconnectsRef.current = 0;
      autoRequeueCountRef.current = 0;
      if (holdingDeviceClaimRef.current) {
        holdingDeviceClaimRef.current = false;
        publishDeviceSession("released");
      }
      const client = wsClientRef.current;
      wsClientRef.current = null;
      if (client) {
        client.disconnect();
      }
      useAppStore.getState().resetChat();
    };
  }, []);

  return {
    ...store,
    mode,
    sendCooldownSeconds,
    reactionBursts,
    joinQueue,
    sendMessage,
    sendTyping,
    sendReaction,
    removeReactionBurst,
    nextChat,
    stopChat,
    blockPartner,
    reportPartner,
    localStream: video.localStream,
    remoteStream: video.remoteStream,
    videoStatus: video.status,
    cameraOn: video.cameraOn,
    micOn: video.micOn,
    partnerCameraOn: video.partnerCameraOn,
    partnerMicOn: video.partnerMicOn,
    partnerMediaAvailable: video.partnerMediaAvailable,
    toggleMic: video.toggleMic,
    facePresenceWarning: facePresence.warning,
    facePresenceSecondsLeft: facePresence.secondsLeft,
  };
}
