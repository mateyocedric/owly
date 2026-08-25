export interface ReportItem {
  id: string;
  reporterSessionId: string;
  reportedSessionId: string;
  roomId: string;
  category: string;
  description?: string;
  messageContext?: Array<{
    sender: "self" | "partner";
    content: string;
    timestamp: string;
  }>;
  status: string;
  createdAt: string;
}

export type PaginatedReports = {
  reports: ReportItem[];
  total: number;
  page: number;
  limit: number;
};
