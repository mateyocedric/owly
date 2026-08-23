import { useEffect, useRef, useCallback, useState } from "react";
import { RATE_LIMITS } from "@owly/shared";
import type { ClientEvent } from "@owly/shared";
import { useAppStore } from "../lib/store.js";
import { OwlyWSClient } from "../lib/ws-client.js";
import { apiFetch } from "../lib/api.js";
import { nanoid } from "nanoid";
import {
  useWebRTC,
  type WebrtcInboundHandlers,
} from "./useWebRTC.js";

export function useChat() {
  const store = useAppStore();
  const wsClientRef = useRef<OwlyWSClient | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const autoQueueTimerRef = useRef<number | null>(null);
  const cooldownTimerRef = useRef<number | null>(null);
  const cooldownEndRef = useRef(0);
  const lastOutgoingIdRef = useRef<string | null>(null);
  const webrtcHandlersRef = useRef<WebrtcInboundHandlers | null>(null);
  const [sendCooldownSeconds, setSendCooldownSeconds] = useState(0);
  const [webrtcInitiator, setWebrtcInitiator] = useState<boolean | null>(null);

  const sendClientEvent = useCallback((event: ClientEvent) => {
    wsClientRef.current?.send(event);
  }, []);

  const videoEnabled =
    store.connectionState === "connected" && !!store.roomId;

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

      wsClientRef.current.on((event) => {
        switch (event.type) {
          case "queue.waiting":
            setWebrtcInitiator(null);
            store.setConnectionState("finding");
            store.setQueuePosition(event.data.position ?? 1);
            break;

          case "match.found":
            clearSendCooldown();
            lastOutgoingIdRef.current = null;
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

          case "chat.partner_left":
            setWebrtcInitiator(null);
            store.setConnectionState("partner_left");
            store.addMessage({
              id: nanoid(),
              sender: "system",
              content: "Stranger has disconnected. Finding you a new partner in 2 seconds...",
              timestamp: new Date(),
            });

            clearAutoQueueTimer();
            autoQueueTimerRef.current = window.setTimeout(() => {
              autoQueueTimerRef.current = null;
              if (!wsClientRef.current) return;
              const { interests } = useAppStore.getState();
              store.setConnectionState("finding");
              store.clearMessages();
              wsClientRef.current.send({
                type: "queue.join",
                data: { interests },
              });
            }, 2000);
            break;

          case "chat.ended":
            setWebrtcInitiator(null);
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
  }, [store, clearAutoQueueTimer, clearSendCooldown, startSendCooldown]);

  const joinQueue = useCallback(
    async (interests?: string[]) => {
      try {
        const client = await initWS();
        if (!client) return;

        setWebrtcInitiator(null);
        store.setConnectionState("finding");
        store.clearMessages();
        client.send({
          type: "queue.join",
          data: { interests: interests || store.interests },
        });
      } catch (err) {
        console.error("Failed to join queue:", err);
        store.setConnectionState("error");
      }
    },
    [initWS, store]
  );

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

  const nextChat = useCallback(() => {
    if (!wsClientRef.current) return;
    clearAutoQueueTimer();
    clearSendCooldown();
    lastOutgoingIdRef.current = null;
    setWebrtcInitiator(null);
    store.setConnectionState("finding");
    store.clearMessages();
    wsClientRef.current.send({ type: "chat.next" });
  }, [store, clearAutoQueueTimer, clearSendCooldown]);

  const stopChat = useCallback(() => {
    if (!wsClientRef.current) return;
    clearAutoQueueTimer();
    clearSendCooldown();
    lastOutgoingIdRef.current = null;
    setWebrtcInitiator(null);
    wsClientRef.current.send({ type: "chat.stop" });
    store.setConnectionState("idle");
  }, [store, clearAutoQueueTimer, clearSendCooldown]);

  const blockPartner = useCallback(() => {
    if (!wsClientRef.current) return;
    clearAutoQueueTimer();
    setWebrtcInitiator(null);
    wsClientRef.current.send({ type: "chat.block" });
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
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  return {
    ...store,
    sendCooldownSeconds,
    joinQueue,
    sendMessage,
    sendTyping,
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
    toggleCamera: video.toggleCamera,
    toggleMic: video.toggleMic,
  };
}
