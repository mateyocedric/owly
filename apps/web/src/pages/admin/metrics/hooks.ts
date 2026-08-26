import { useQuery } from "@tanstack/react-query";
import type { HealthResponse } from "@owly/shared";
import { apiFetch } from "../../../lib/api.js";
import { apiBaseUrl } from "../../../lib/config.js";
import type { AdminMetricsData } from "./Dashboard.js";

export const ADMIN_METRICS_QUERY_KEY = ["admin", "metrics"] as const;
export const HEALTH_QUERY_KEY = ["health"] as const;

const HEALTH_REFETCH_INTERVAL_MS = 15_000;

function healthUrl(): string {
  const base = apiBaseUrl();
  return base ? `${base}/health` : "/health";
}

export function useAdminMetricsQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: ADMIN_METRICS_QUERY_KEY,
    queryFn: async () => {
      const data = await apiFetch<{ metrics: AdminMetricsData }>(
        "/admin/metrics"
      );
      return data.metrics;
    },
    enabled,
  });
}

export function useHealthQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: HEALTH_QUERY_KEY,
    queryFn: async (): Promise<HealthResponse> => {
      const res = await fetch(healthUrl(), {
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      const data = await res.json().catch(() => null);
      if (
        !data ||
        typeof data !== "object" ||
        typeof (data as { status?: unknown }).status !== "string"
      ) {
        throw new Error(
          res.ok
            ? "Invalid health response."
            : `Health check failed with status ${res.status}`
        );
      }

      // 200 (ok) and 503 (degraded) both carry a usable payload.
      if (res.status !== 200 && res.status !== 503) {
        throw new Error(
          (data as { error?: string }).error ||
            `Health check failed with status ${res.status}`
        );
      }

      return data as HealthResponse;
    },
    refetchInterval: HEALTH_REFETCH_INTERVAL_MS,
    enabled,
  });
}
