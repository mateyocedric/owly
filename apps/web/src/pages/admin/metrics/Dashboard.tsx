import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@owly/ui";
import { Users, MessageSquare, AlertTriangle, ShieldCheck } from "lucide-react";

export interface AdminMetricsData {
  totalSessions: number;
  activeSessions: number;
  totalRooms: number;
  pendingReports: number;
  totalBans: number;
}

interface DashboardProps {
  metrics: AdminMetricsData;
}

export function AdminDashboardMetrics({ metrics }: DashboardProps) {
  const cards = [
    {
      title: "Active Sessions",
      value: metrics.activeSessions,
      sub: `${metrics.totalSessions} lifetime`,
      icon: Users,
    },
    {
      title: "Chat Rooms Created",
      value: metrics.totalRooms,
      sub: "Total pairs matched",
      icon: MessageSquare,
    },
    {
      title: "Pending Reports",
      value: metrics.pendingReports,
      sub: "Require review",
      icon: AlertTriangle,
    },
    {
      title: "Total Bans Active",
      value: metrics.totalBans,
      sub: "Enforced by staff/filter",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)] shadow-none"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
