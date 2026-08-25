import { create } from "zustand";
import { GENDERS, type ConnectionState, type ChatMessage, type Gender } from "@owly/shared";

export interface UserSession {
  sessionId: string;
  token: string;
  expiresAt: string;
  ageVerified: boolean;
  interests: string[];
  gender: Gender | null;
}

interface AppState {
  session: UserSession | null;
  ageVerified: boolean;
  gender: Gender | null;
  interests: string[];
  connectionState: ConnectionState;
  connectionError: string | null;
  roomId: string | null;
  commonInterests: string[];
  partnerGender: Gender | null;
  queuePosition: number | null;
  messages: ChatMessage[];
  partnerTyping: boolean;
  moderationWarning: string | null;

  // Actions
  setSession: (session: UserSession | null) => void;
  setAgeVerified: (verified: boolean) => void;
  setGender: (gender: Gender | null) => void;
  setInterests: (interests: string[]) => void;
  setConnectionState: (state: ConnectionState, error?: string | null) => void;
  setRoomId: (
    roomId: string | null,
    commonInterests?: string[],
    partnerGender?: Gender | null
  ) => void;
  setQueuePosition: (pos: number | null) => void;
  addMessage: (msg: ChatMessage) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setPartnerTyping: (typing: boolean) => void;
  setModerationWarning: (warning: string | null) => void;
  resetChat: () => void;
}

const SESSION_STORAGE_KEY = "owly_session";
const GENDER_STORAGE_KEY = "owly_gender";

const savedAgeVerified =
  typeof window !== "undefined"
    ? localStorage.getItem("owly_age_verified") === "true"
    : false;

function parseGender(value: unknown): Gender | null {
  return typeof value === "string" && (GENDERS as readonly string[]).includes(value)
    ? (value as Gender)
    : null;
}

function loadSavedGender(): Gender | null {
  if (typeof window === "undefined") return null;
  return parseGender(localStorage.getItem(GENDER_STORAGE_KEY));
}

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
    return {
      ...parsed,
      gender: parseGender(parsed.gender),
    };
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

function persistGender(gender: Gender | null) {
  if (typeof window === "undefined") return;
  if (gender) {
    localStorage.setItem(GENDER_STORAGE_KEY, gender);
  } else {
    localStorage.removeItem(GENDER_STORAGE_KEY);
  }
}

const savedSession = loadSavedSession();
const savedGender = loadSavedGender() ?? savedSession?.gender ?? null;

export const useAppStore = create<AppState>((set) => ({
  session: savedSession,
  ageVerified: savedAgeVerified,
  gender: savedGender,
  interests: savedSession?.interests ?? [],
  connectionState: "idle",
  connectionError: null,
  roomId: null,
  commonInterests: [],
  partnerGender: null,
  queuePosition: null,
  messages: [],
  partnerTyping: false,
  moderationWarning: null,

  setSession: (session) => {
    persistSession(session);
    return set((state) => ({
      session,
      ageVerified: session ? session.ageVerified : state.ageVerified,
      gender: session?.gender ?? state.gender,
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

  setGender: (gender) => {
    persistGender(gender);
    return set((state) => {
      const session = state.session ? { ...state.session, gender } : null;
      if (session) persistSession(session);
      return { gender, session };
    });
  },

  setInterests: (interests) =>
    set((state) => ({
      interests,
      session: state.session
        ? { ...state.session, interests }
        : null,
    })),

  setConnectionState: (connectionState, error) =>
    set({
      connectionState,
      connectionError: connectionState === "error" ? error ?? null : null,
    }),
  setRoomId: (roomId, commonInterests = [], partnerGender = null) =>
    set({
      roomId,
      commonInterests,
      partnerGender: roomId ? partnerGender : null,
      partnerTyping: false,
    }),
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
      connectionError: null,
      roomId: null,
      commonInterests: [],
      partnerGender: null,
      queuePosition: null,
      messages: [],
      partnerTyping: false,
      moderationWarning: null,
    }),
}));
