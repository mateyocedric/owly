import React from "react";
import { AdminSection } from "../../../components/design/index.js";
import { AdminDashboardMetrics } from "./Dashboard.js";
import { useAdminMetricsQuery } from "./hooks.js";

export function AdminMetricsPage() {
  const { data: metrics, isLoading, isError, error } = useAdminMetricsQuery();

  if (isLoading) {
    return (
      <AdminSection title="Overview" description="Platform health at a glance">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-[var(--sx-rounded-sm)] border border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)]"
            />
          ))}
        </div>
      </AdminSection>
    );
  }

  if (isError || !metrics) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load metrics."}
      </p>
    );
  }

  return (
    <AdminSection title="Overview" description="Platform health at a glance">
      <AdminDashboardMetrics metrics={metrics} />
    </AdminSection>
  );
}
