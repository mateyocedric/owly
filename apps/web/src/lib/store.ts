import { create } from "zustand";
import type { ConnectionState, ChatMessage } from "@owly/shared";

export interface UserSession {
  sessionId: string;
  token: string;
  expiresAt: string;
  ageVerified: boolean;
  interests: string[];
}

interface AppState {
  session: UserSession | null;
  ageVerified: boolean;
  interests: string[];
  connectionState: ConnectionState;
  roomId: string | null;
  commonInterests: string[];
  queuePosition: number | null;
  messages: ChatMessage[];
  partnerTyping: boolean;
  moderationWarning: string | null;

  // Actions
  setSession: (session: UserSession | null) => void;
  setAgeVerified: (verified: boolean) => void;
  setInterests: (interests: string[]) => void;
  setConnectionState: (state: ConnectionState) => void;
  setRoomId: (roomId: string | null, commonInterests?: string[]) => void;
  setQueuePosition: (pos: number | null) => void;
  addMessage: (msg: ChatMessage) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setPartnerTyping: (typing: boolean) => void;
  setModerationWarning: (warning: string | null) => void;
  resetChat: () => void;
}

const SESSION_STORAGE_KEY = "owly_session";

const savedAgeVerified =
  typeof window !== "undefined"
    ? localStorage.getItem("owly_age_verified") === "true"
    : false;

function loadSavedSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserSession;
    if (!parsed?.token || !parsed.expiresAt) return null;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persistSession(session: UserSession | null) {
  if (typeof window === "undefined") return;
  if (session) {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

const savedSession = loadSavedSession();

export const useAppStore = create<AppState>((set) => ({
  session: savedSession,
  ageVerified: savedAgeVerified,
  interests: savedSession?.interests ?? [],
  connectionState: "idle",
  roomId: null,
  commonInterests: [],
  queuePosition: null,
  messages: [],
  partnerTyping: false,
  moderationWarning: null,

  setSession: (session) => {
    persistSession(session);
    return set((state) => ({
      session,
      ageVerified: session ? session.ageVerified : state.ageVerified,
    }));
  },

  setAgeVerified: (verified) => {
    if (typeof window !== "undefined") {
      if (verified) {
        localStorage.setItem("owly_age_verified", "true");
      } else {
        localStorage.removeItem("owly_age_verified");
      }
    }
    return set((state) => ({
      ageVerified: verified,
      session: state.session
        ? { ...state.session, ageVerified: verified }
        : null,
    }));
  },

  setInterests: (interests) =>
    set((state) => ({
      interests,
      session: state.session
        ? { ...state.session, interests }
        : null,
    })),

  setConnectionState: (connectionState) => set({ connectionState }),
  setRoomId: (roomId, commonInterests = []) =>
    set({ roomId, commonInterests, partnerTyping: false }),
  setQueuePosition: (queuePosition) => set({ queuePosition }),
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  removeMessage: (id) =>
    set((state) => ({ messages: state.messages.filter((msg) => msg.id !== id) })),
  clearMessages: () => set({ messages: [] }),
  setPartnerTyping: (partnerTyping) => set({ partnerTyping }),
  setModerationWarning: (moderationWarning) => set({ moderationWarning }),
  resetChat: () =>
    set({
      connectionState: "idle",
      roomId: null,
      commonInterests: [],
      queuePosition: null,
      messages: [],
      partnerTyping: false,
      moderationWarning: null,
    }),
}));
