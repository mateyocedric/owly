import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { Session } from "../types.js";
import {
  getSessionQueryKey,
  SESSION_QUERY_GC_MS,
  SESSION_QUERY_STALE_MS,
} from "../session-query-key.js";
import { getSession } from "../services/getSession.js";

type SessionQueryConfig = Partial<
  Omit<
    UseQueryOptions<Session, Error, Session, ReturnType<typeof getSessionQueryKey>>,
    "queryKey" | "queryFn"
  >
>;

export function useSessionQuery(config?: SessionQueryConfig) {
  return useQuery({
    gcTime: SESSION_QUERY_GC_MS,
    staleTime: SESSION_QUERY_STALE_MS,
    ...config,
    queryKey: getSessionQueryKey(),
    queryFn: async ({ signal }) => {
      return await getSession({ signal });
    },
  });
}
