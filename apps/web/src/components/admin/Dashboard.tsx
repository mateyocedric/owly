import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@owly/ui";
import { Users, MessageSquare, AlertTriangle, ShieldCheck } from "lucide-react";

interface DashboardProps {
  metrics: {
    totalSessions: number;
    activeSessions: number;
    totalRooms: number;
    pendingReports: number;
    totalBans: number;
  };
}

export function AdminDashboardMetrics({ metrics }: DashboardProps) {
  const cards = [
    {
      title: "Active Sessions",
      value: metrics.activeSessions,
      sub: `${metrics.totalSessions} lifetime`,
      icon: Users,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Chat Rooms Created",
      value: metrics.totalRooms,
      sub: "Total pairs matched",
      icon: MessageSquare,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Pending Reports",
      value: metrics.pendingReports,
      sub: "Require review",
      icon: AlertTriangle,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Total Bans Active",
      value: metrics.totalBans,
      sub: "Enforced by staff/filter",
      icon: ShieldCheck,
      color: "text-red-400 bg-red-500/10 border-red-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-xl border ${card.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-black text-white">{card.value}</div>
              <p className="text-xs text-zinc-400 mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
