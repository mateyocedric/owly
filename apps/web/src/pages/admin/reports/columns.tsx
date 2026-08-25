import React, { useState } from "react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@owly/ui";
import type { ColumnDef } from "../../../components/data-table/index.js";
import type { ReportItem } from "./types.js";

export function createReportColumns(): ColumnDef<ReportItem>[] {
  return [
    {
      id: "category",
      header: "Category",
      cell: (row) => (
        <Badge variant="destructive" className="text-xs font-semibold">
          {row.category.replace(/_/g, " ").toUpperCase()}
        </Badge>
      ),
    },
    {
      id: "id",
      header: "Report",
      cell: (row) => (
        <code className="text-xs text-foreground">{row.id.slice(-6)}</code>
      ),
    },
    {
      id: "reported",
      header: "Reported session",
      cell: (row) => (
        <code className="text-xs text-foreground">
          {row.reportedSessionId.slice(-8)}
        </code>
      ),
    },
    {
      id: "room",
      header: "Room",
      cell: (row) => (
        <code className="text-xs text-muted-foreground">
          {row.roomId.slice(-6)}
        </code>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <span className="text-xs capitalize text-muted-foreground">
          {row.status}
        </span>
      ),
    },
  ];
}

export function ReportContextButton({ report }: { report: ReportItem }) {
  const [open, setOpen] = useState(false);
  const hasContext =
    Boolean(report.description) ||
    (report.messageContext?.length ?? 0) > 0;

  if (!hasContext) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8"
        onClick={() => setOpen(true)}
      >
        Context
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Report context</DialogTitle>
            <DialogDescription>
              Report <code>{report.id.slice(-6)}</code>
            </DialogDescription>
          </DialogHeader>
          {report.description ? (
            <div className="rounded-[var(--sx-rounded-sm)] border border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)] p-3 text-sm text-foreground">
              <strong className="mb-1 block text-xs text-muted-foreground">
                Reporter comment
              </strong>
              {report.description}
            </div>
          ) : null}
          {report.messageContext && report.messageContext.length > 0 ? (
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-muted-foreground">
                Messages ({report.messageContext.length})
              </span>
              <div className="max-h-64 space-y-1.5 overflow-y-auto rounded-[var(--sx-rounded-sm)] border border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)] p-3 font-mono text-xs">
                {report.messageContext.map((msg, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span
                      className={`shrink-0 font-semibold ${
                        msg.sender === "partner"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      [{msg.sender === "partner" ? "Reported" : "Reporter"}]:
                    </span>
                    <span className="break-all text-foreground">{msg.content}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
