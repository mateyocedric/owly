const DEFAULT_OWLY_EMAIL = "support@owly.fun";
const DEFAULT_SITE_URL = "https://owly.fun";

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function siteUrl(path = "/"): string {
  const base = trimSlash(import.meta.env.VITE_SITE_URL?.trim() || DEFAULT_SITE_URL);
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function owlyEmail(): string {
  return import.meta.env.VITE_OWLY_EMAIL?.trim() || DEFAULT_OWLY_EMAIL;
}

export function owlyMailto(): string {
  return `mailto:${owlyEmail()}`;
}

export function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL?.trim();
  return raw ? trimSlash(raw) : "";
}

export function websocketUrl(token?: string | null): string {
  const configured = import.meta.env.VITE_WS_URL?.trim();
  const tokenQuery = token ? `token=${encodeURIComponent(token)}` : "";

  if (configured) {
    const url = new URL(trimSlash(configured));
    if (token) url.searchParams.set("token", token);
    return url.toString();
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws${tokenQuery ? `?${tokenQuery}` : ""}`;
}
