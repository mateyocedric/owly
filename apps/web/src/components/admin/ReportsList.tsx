import React from "react";
import { Button, Badge } from "@owly/ui";
import { Check, X, ShieldAlert } from "lucide-react";

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

interface ReportsListProps {
  reports: ReportItem[];
  onResolve: (reportId: string, status: "resolved" | "dismissed") => void;
  onBanUser: (sessionId: string, reportId: string) => void;
}

export function ReportsList({
  reports,
  onResolve,
  onBanUser,
}: ReportsListProps) {
  if (reports.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-zinc-400 bg-zinc-900/40 rounded-xl border border-zinc-800">
        No moderation reports matching this filter.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4 shadow-md"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="font-semibold text-xs">
                {report.category.replace(/_/g, " ").toUpperCase()}
              </Badge>
              <span className="text-xs text-zinc-400">
                Report ID: <code className="text-zinc-300">{report.id.slice(-6)}</code>
              </span>
            </div>
            <span className="text-xs text-zinc-400">
              {new Date(report.createdAt).toLocaleString()}
            </span>
          </div>

          {report.description && (
            <div className="text-sm text-zinc-200 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
              <strong className="text-xs text-zinc-400 block mb-1">Reporter comment:</strong>
              {report.description}
            </div>
          )}

          {/* Captured Message Context */}
          {report.messageContext && report.messageContext.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-zinc-400 block mb-2">
                Captured Message Context ({report.messageContext.length} messages):
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 bg-zinc-950/80 rounded-lg border border-zinc-800 text-xs font-mono">
                {report.messageContext.map((msg, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span
                      className={`font-semibold shrink-0 ${
                        msg.sender === "partner"
                          ? "text-red-400"
                          : "text-violet-400"
                      }`}
                    >
                      [{msg.sender === "partner" ? "Reported" : "Reporter"}]:
                    </span>
                    <span className="text-zinc-200 break-all">{msg.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Controls */}
          {report.status === "pending" && (
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResolve(report.id, "dismissed")}
                className="text-zinc-400 hover:text-zinc-200 border-zinc-700"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Dismiss
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onResolve(report.id, "resolved")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Mark Resolved
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  onBanUser(report.reportedSessionId, report.id)
                }
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                Ban Reported User
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
