import React from "react";
import { AdminSection } from "../../../components/design/index.js";
import { AdminDashboardMetrics } from "./Dashboard.js";
import { HealthDashboard } from "./HealthDashboard.js";
import { useAdminMetricsQuery, useHealthQuery } from "./hooks.js";

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-[var(--sx-rounded-sm)] border border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)]"
        />
      ))}
    </div>
  );
}

export function AdminMetricsPage() {
  const {
    data: health,
    isLoading: healthLoading,
    isError: healthError,
    error: healthErr,
  } = useHealthQuery();
  const {
    data: metrics,
    isLoading: metricsLoading,
    isError: metricsError,
    error: metricsErr,
  } = useAdminMetricsQuery();

  return (
    <div className="space-y-6">
      <AdminSection
        title="Service health"
        description="API, database, and Redis status"
      >
        {healthLoading ? (
          <MetricsSkeleton />
        ) : healthError || !health ? (
          <p className="text-sm text-destructive">
            {healthErr instanceof Error
              ? healthErr.message
              : "Failed to load health."}
          </p>
        ) : (
          <HealthDashboard health={health} />
        )}
      </AdminSection>

      <AdminSection title="Overview" description="Platform health at a glance">
        {metricsLoading ? (
          <MetricsSkeleton />
        ) : metricsError || !metrics ? (
          <p className="text-sm text-destructive">
            {metricsErr instanceof Error
              ? metricsErr.message
              : "Failed to load metrics."}
          </p>
        ) : (
          <AdminDashboardMetrics metrics={metrics} />
        )}
      </AdminSection>
    </div>
  );
}
