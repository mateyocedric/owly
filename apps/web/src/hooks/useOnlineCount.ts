import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api.js";
import type { OnlineStatsResponse } from "@owly/shared";

const POLL_INTERVAL_MS = 15_000;

export function useOnlineCount() {
  const [onlineCount, setOnlineCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const data = await apiFetch<OnlineStatsResponse>("/stats/online");
        if (!cancelled) {
          setOnlineCount(data.online);
        }
      } catch {
        // Keep the last good value on transient errors.
      }
    };

    void fetchCount();
    const intervalId = window.setInterval(fetchCount, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return onlineCount;
}
