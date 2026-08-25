import { useAppStore } from "./store.js";
import { apiBaseUrl } from "./config.js";
import { clearAdminToken, getAdminToken } from "../client/lib/admin-token.js";

function requestPath(endpoint: string): string {
  if (endpoint.startsWith("http")) {
    try {
      return new URL(endpoint).pathname;
    } catch {
      return endpoint;
    }
  }
  return endpoint.split("?")[0] ?? endpoint;
}

function isAdminEndpoint(endpoint: string): boolean {
  const path = requestPath(endpoint);
  return path === "/admin" || path.startsWith("/admin/") || path.includes("/api/admin/");
}

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
    if (isAdminEndpoint(endpoint)) {
      const adminToken = getAdminToken();
      if (adminToken) {
        headers.set("Authorization", `Bearer ${adminToken}`);
      }
    } else {
      const sessionToken = useAppStore.getState().session?.token;
      if (sessionToken) {
        headers.set("Authorization", `Bearer ${sessionToken}`);
      }
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && isAdminEndpoint(endpoint)) {
      clearAdminToken();
    }
    throw new Error(
      (data as { error?: string }).error ||
        `Request failed with status ${res.status}`
    );
  }

  return data as T;
}
