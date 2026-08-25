import React, { useState } from "react";
import { Button } from "@owly/ui";
import { Check, ShieldAlert, X } from "lucide-react";
import { AdminSection } from "../../../components/design/index.js";
import { DataTable } from "../../../components/data-table/index.js";
import { createReportColumns, ReportContextButton } from "./columns.js";
import {
  useBanFromReportMutation,
  usePendingReportsQuery,
  useResolveReportMutation,
} from "./hooks.js";
import type { ReportItem } from "./types.js";

const columns = createReportColumns();

export function AdminReportsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { data, isLoading, isError, error } = usePendingReportsQuery({
    page,
    pageSize,
  });
  const resolveMutation = useResolveReportMutation();
  const banMutation = useBanFromReportMutation();

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load reports."}
      </p>
    );
  }

  const reports = data?.reports ?? [];
  const total = data?.total ?? 0;

  return (
    <AdminSection
      title="Pending reports"
      description="Review and resolve moderation reports"
      contentClassName="overflow-hidden p-0"
    >
      <DataTable<ReportItem>
        columns={columns}
        data={reports}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No moderation reports matching this filter."
        className="rounded-none border-0"
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        }}
        rowActions={(row) => (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <ReportContextButton report={row} />
            {row.status === "pending" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={resolveMutation.isPending || banMutation.isPending}
                  onClick={() =>
                    resolveMutation.mutate({
                      reportId: row.id,
                      status: "dismissed",
                    })
                  }
                >
                  <X className="mr-1 size-3.5" />
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  className="h-8"
                  disabled={resolveMutation.isPending || banMutation.isPending}
                  onClick={() =>
                    resolveMutation.mutate({
                      reportId: row.id,
                      status: "resolved",
                    })
                  }
                >
                  <Check className="mr-1 size-3.5" />
                  Resolve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8"
                  disabled={resolveMutation.isPending || banMutation.isPending}
                  onClick={() =>
                    banMutation.mutate({
                      sessionId: row.reportedSessionId,
                      reportId: row.id,
                    })
                  }
                >
                  <ShieldAlert className="mr-1 size-3.5" />
                  Ban
                </Button>
              </>
            ) : null}
          </div>
        )}
      />
    </AdminSection>
  );
}
