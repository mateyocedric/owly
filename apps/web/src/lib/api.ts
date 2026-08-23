import { useAppStore } from "./store.js";
import { apiBaseUrl } from "./config.js";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${apiBaseUrl()}/api${endpoint}`;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Authorization")) {
    const sessionToken = useAppStore.getState().session?.token;
    if (sessionToken) {
      headers.set("Authorization", `Bearer ${sessionToken}`);
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error ||
        `Request failed with status ${res.status}`
    );
  }

  return data as T;
}
