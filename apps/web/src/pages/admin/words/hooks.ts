import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiFetch } from "../../../lib/api.js";

export const ADMIN_BANNED_WORDS_QUERY_KEY = [
  "admin",
  "config",
  "banned-words",
] as const;

export function useBannedWordsQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: ADMIN_BANNED_WORDS_QUERY_KEY,
    queryFn: async () => {
      const data = await apiFetch<{ words: string[] }>(
        "/admin/config/banned-words"
      );
      return data.words ?? [];
    },
    enabled,
  });
}

export function useUpdateBannedWordsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (words: string[]) => {
      await apiFetch("/admin/config/banned-words", {
        method: "PUT",
        body: JSON.stringify({ words }),
      });
    },
    onSuccess: () => {
      toast.success("Banned words successfully updated.");
      void queryClient.invalidateQueries({
        queryKey: ADMIN_BANNED_WORDS_QUERY_KEY,
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Save failed";
      toast.error(message);
    },
  });
}
