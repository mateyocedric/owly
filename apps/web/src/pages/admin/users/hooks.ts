import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "../../../lib/api.js";
import { ADMIN_METRICS_QUERY_KEY } from "../metrics/hooks.js";
import type { PaginatedSessions } from "./types.js";

export const ADMIN_USERS_QUERY_KEY = ["admin", "users"] as const;

type UsersQueryParams = {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
};

export function useAdminUsersQuery({
  page = 1,
  pageSize = 25,
  enabled = true,
}: UsersQueryParams = {}) {
  return useQuery({
    queryKey: [...ADMIN_USERS_QUERY_KEY, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
      });
      return apiFetch<PaginatedSessions>(`/admin/users?${params}`);
    },
    enabled,
  });
}

export function useModerateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      action,
      reason,
    }: {
      sessionId: string;
      action: string;
      reason: string;
    }) => {
      await apiFetch(`/admin/users/${sessionId}/moderate`, {
        method: "POST",
        body: JSON.stringify({ action, reason }),
      });
    },
    onSuccess: () => {
      toast.success("Moderation action applied successfully.");
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_METRICS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Moderation failed";
      toast.error(message);
    },
  });
}
