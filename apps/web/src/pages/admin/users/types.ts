export interface SessionItem {
  id: string;
  status: string;
  ipHash: string;
  interests: string[];
  createdAt: string;
  lastActiveAt: string;
}

export type PaginatedSessions = {
  sessions: SessionItem[];
  total: number;
  page: number;
  limit: number;
};
