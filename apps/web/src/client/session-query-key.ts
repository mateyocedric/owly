import type { QueryKey } from "@tanstack/react-query";

export const SESSION_QUERY_KEY = ["session"] as const;

export const SESSION_QUERY_STALE_MS = 1_000;

export const SESSION_QUERY_GC_MS = 2_000;

export const getSessionQueryKey = (): QueryKey => SESSION_QUERY_KEY;
