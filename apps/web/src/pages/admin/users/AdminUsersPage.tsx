import React, { useState } from "react";
import { Badge, Button } from "@owly/ui";
import { AdminSection } from "../../../components/design/index.js";
import {
  DataTable,
  type ColumnDef,
} from "../../../components/data-table/index.js";
import { ModerationForm } from "./ModerationForm.js";
import { useAdminUsersQuery, useModerateUserMutation } from "./hooks.js";
import type { SessionItem } from "./types.js";

const columns: ColumnDef<SessionItem>[] = [
  {
    id: "id",
    header: "Session ID",
    cell: (row) => (
      <code className="text-xs text-foreground">{row.id.slice(-8)}</code>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <Badge
        variant={
          row.status === "active"
            ? "success"
            : row.status === "warned"
              ? "warning"
              : "destructive"
        }
      >
        {row.status}
      </Badge>
    ),
  },
  {
    id: "ipHash",
    header: "IP Hash",
    cell: (row) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.ipHash.slice(0, 10)}...
      </span>
    ),
  },
  {
    id: "interests",
    header: "Interests",
    cell: (row) => (
      <span className="text-xs text-muted-foreground">
        {row.interests?.length ? row.interests.join(", ") : "—"}
      </span>
    ),
  },
  {
    id: "lastActiveAt",
    header: "Last Active",
    cell: (row) => (
      <span className="text-xs text-muted-foreground">
        {new Date(row.lastActiveAt).toLocaleString()}
      </span>
    ),
  },
];

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const { data, isLoading, isError, error } = useAdminUsersQuery({
    page,
    pageSize,
  });
  const moderateMutation = useModerateUserMutation();

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load users."}
      </p>
    );
  }

  const sessions = data?.sessions ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <AdminSection
        title="Apply moderation"
        description="Warn, ban, or unban a session by ID"
      >
        <ModerationForm
          initialSessionId={selectedSessionId}
          isPending={moderateMutation.isPending}
          onModerate={(sessionId, action, reason) => {
            moderateMutation.mutate({ sessionId, action, reason });
            setSelectedSessionId("");
          }}
        />
      </AdminSection>

      <AdminSection
        title="Sessions"
        description="Recent anonymous sessions"
        contentClassName="p-0 overflow-hidden"
      >
        <DataTable<SessionItem>
          columns={columns}
          data={sessions}
          getRowId={(row) => row.id}
          isLoading={isLoading}
          emptyMessage="No sessions found."
          className="border-0 rounded-none"
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setSelectedSessionId(row.id)}
            >
              Select
            </Button>
          )}
        />
      </AdminSection>
    </div>
  );
}
