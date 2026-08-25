import { apiFetch } from "../../lib/api.js";
import { getAdminToken } from "../lib/admin-token.js";
import type { Session, SessionUser } from "../types.js";

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export async function getSession(options?: {
  signal?: AbortSignal;
}): Promise<Session> {
  if (!getAdminToken()) {
    return { status: "unauthenticated" };
  }

  try {
    const data = await apiFetch<{
      status: "authenticated";
      user: SessionUser;
    }>("/admin/auth/session", {
      method: "GET",
      signal: options?.signal,
    });
    return { status: "authenticated", user: data.user };
  } catch (error) {
    if (isAbortError(error)) throw error;
    return { status: "unauthenticated" };
  }
}
