import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../../lib/api.js";
import type { AdminMetricsData } from "./Dashboard.js";

export const ADMIN_METRICS_QUERY_KEY = ["admin", "metrics"] as const;

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
