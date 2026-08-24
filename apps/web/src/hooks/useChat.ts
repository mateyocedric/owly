import { useEffect, useRef, useCallback, useState } from "react";
import { RATE_LIMITS } from "@owly/shared";
import type { ChatReactionEmoji, ClientEvent } from "@owly/shared";
import { useAppStore } from "../lib/store.js";
import { OwlyWSClient } from "../lib/ws-client.js";
import { apiFetch } from "../lib/api.js";
import { nanoid } from "nanoid";
import {
  useWebRTC,
  type WebrtcInboundHandlers,
} from "./useWebRTC.js";
import type { ReactionBurst } from "../components/chat/ReactionBurstOverlay.js";

function createReactionBurst(
  emoji: ChatReactionEmoji,
  from: "self" | "partner"
): ReactionBurst {
  // Self bursts lean left; partner bursts lean right, with light random drift.
  const xBase = from === "self" ? 28 : 72;
  const x = Math.min(88, Math.max(12, xBase + (Math.random() * 16 - 8)));
  const drift = (Math.random() * 48 - 24) * (from === "self" ? 1 : -1);
  return { id: nanoid(), emoji, from, x, drift };
}

export function useChat() {
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
  const reconnectSoonRef = useRef<number | null>(null);
  const findingReconnectsRef = useRef(0);
  const [sendCooldownSeconds, setSendCooldownSeconds] = useState(0);
  const [webrtcInitiator, setWebrtcInitiator] = useState<boolean | null>(null);
  const [reactionBursts, setReactionBursts] = useState<ReactionBurst[]>([]);

  const clearReactionBursts = useCallback(() => {
    setReactionBursts([]);
  }, []);

  const pushReactionBurst = useCallback(
    (emoji: ChatReactionEmoji, from: "self" | "partner") => {
      setReactionBursts((prev) => [...prev, createReactionBurst(emoji, from)]);
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
    clearReconnectSoon();
  }, [clearReconnectSoon]);

  const scheduleAutoQueue = useCallback(
    (message: string) => {
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
    [clearAutoQueueTimer]
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
    let session = store.session;
    const sessionExpired =
      !!session?.expiresAt && new Date(session.expiresAt).getTime() <= Date.now();

    if (!session || !session.token || sessionExpired) {
      try {
        const created = await apiFetch<{
          sessionId: string;
          token: string;
          expiresAt: string;
        }>("/session", {
          method: "POST",
          body: JSON.stringify({ interests: store.interests || [] }),
        });

        session = {
          sessionId: created.sessionId,
          token: created.token,
          expiresAt: created.expiresAt,
          ageVerified: true,
          interests: store.interests || [],
        };
        store.setSession(session);
      } catch (err) {
        console.error("Failed to establish session:", err);
        store.setConnectionState("error");
        return null;
      }
    }

    if (!wsClientRef.current) {
      wsClientRef.current = new OwlyWSClient(session.token);

      wsClientRef.current.onClose(() => {
        const { connectionState } = useAppStore.getState();
        setWebrtcInitiator(null);
        store.setRoomId(null);

        if (connectionState === "finding" || joiningRef.current) {
          store.setConnectionState("finding");
          findingReconnectsRef.current += 1;
          if (findingReconnectsRef.current > 3) {
            joiningRef.current = false;
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

        if (
          connectionState === "connected" ||
          connectionState === "partner_left"
        ) {
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
            store.setRoomId(event.data.roomId, event.data.commonInterests);
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
            pushReactionBurst(event.data.emoji, "partner");
            break;

          case "chat.partner_left":
            clearReactionBursts();
            setWebrtcInitiator(null);
            store.setRoomId(null);
            store.setConnectionState("partner_left");
            scheduleAutoQueue(
              "Stranger has disconnected. Finding you a new partner in 2 seconds..."
            );
            break;

          case "chat.ended":
            markQueueSettled();
            clearAutoQueueTimer();
            clearReactionBursts();
            setWebrtcInitiator(null);
            store.setRoomId(null);
            store.setConnectionState("idle");
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
            webrtcHandlersRef.current?.onSignal(event.data);
            break;

          case "video.state":
            webrtcHandlersRef.current?.onVideoState(event.data);
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
    } catch (err) {
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
    scheduleAutoQueue,
    markQueueSettled,
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
          data: { interests: interests || store.interests },
        });
      } catch (err) {
        console.error("Failed to join queue:", err);
        joiningRef.current = false;
        store.setConnectionState("error");
      }
    },
    [initWS, store, clearAutoQueueTimer, clearReconnectSoon]
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
    (emoji: ChatReactionEmoji) => {
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

      pushReactionBurst(emoji, "self");
      wsClientRef.current.send({
        type: "chat.reaction",
        data: { emoji },
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
    store.setRoomId(null);
    store.setConnectionState("idle");
  }, [store, clearAutoQueueTimer, clearReconnectSoon, clearSendCooldown]);

  const blockPartner = useCallback(() => {
    if (!wsClientRef.current) return;
    clearAutoQueueTimer();
    setWebrtcInitiator(null);
    wsClientRef.current.send({ type: "chat.block" });
    store.setRoomId(null);
    store.setConnectionState("idle");
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
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (autoQueueTimerRef.current) clearTimeout(autoQueueTimerRef.current);
      if (reconnectSoonRef.current) clearTimeout(reconnectSoonRef.current);
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      joiningRef.current = false;
      findingReconnectsRef.current = 0;
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
    toggleCamera: video.toggleCamera,
    toggleMic: video.toggleMic,
  };
}
