import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "../../../lib/api.js";
import { ADMIN_METRICS_QUERY_KEY } from "../metrics/hooks.js";
import type { PaginatedReports } from "./types.js";

export const ADMIN_REPORTS_QUERY_KEY = ["admin", "reports"] as const;

type ReportsQueryParams = {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
};

export function usePendingReportsQuery({
  page = 1,
  pageSize = 25,
  enabled = true,
}: ReportsQueryParams = {}) {
  return useQuery({
    queryKey: [...ADMIN_REPORTS_QUERY_KEY, "pending", page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: "pending",
        page: String(page),
        limit: String(pageSize),
      });
      return apiFetch<PaginatedReports>(`/admin/reports?${params}`);
    },
    enabled,
  });
}

export function useResolveReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
    }: {
      reportId: string;
      status: "resolved" | "dismissed";
    }) => {
      await apiFetch(`/admin/reports/${reportId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_REPORTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_METRICS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Action failed";
      toast.error(message);
    },
  });
}

export function useBanFromReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      reportId,
    }: {
      sessionId: string;
      reportId: string;
    }) => {
      await apiFetch(`/admin/users/${sessionId}/moderate`, {
        method: "POST",
        body: JSON.stringify({
          action: "permanent_ban",
          reason: `Report ${reportId.slice(-6)} verified violation`,
        }),
      });
      await apiFetch(`/admin/reports/${reportId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "resolved" }),
      });
    },
    onSuccess: () => {
      toast.success("User banned and report resolved.");
      void queryClient.invalidateQueries({ queryKey: ADMIN_REPORTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_METRICS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Ban failed";
      toast.error(message);
    },
  });
}
