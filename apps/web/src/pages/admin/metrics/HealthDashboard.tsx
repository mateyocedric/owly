import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@owly/ui";
import type { HealthResponse } from "@owly/shared";
import {
  Activity,
  Database,
  HardDrive,
  Timer,
  type LucideIcon,
} from "lucide-react";

interface HealthDashboardProps {
  health: HealthResponse;
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours < 24) {
    return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
}

function isUnhealthy(value: string): boolean {
  return value !== "ok";
}

interface HealthCard {
  title: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  unhealthy?: boolean;
}

export function HealthDashboard({ health }: HealthDashboardProps) {
  const cards: HealthCard[] = [
    {
      title: "Status",
      value: health.status,
      sub: "Overall API",
      icon: Activity,
      unhealthy: isUnhealthy(health.status),
    },
    {
      title: "Database",
      value: health.services.database,
      sub: "MongoDB connection",
      icon: Database,
      unhealthy: isUnhealthy(health.services.database),
    },
    {
      title: "Redis",
      value: health.services.redis,
      sub: "Cache & presence",
      icon: HardDrive,
      unhealthy: isUnhealthy(health.services.redis),
    },
    {
      title: "Uptime",
      value: formatUptime(health.uptime),
      sub: `v${health.version}`,
      icon: Timer,
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
              <div
                className={`text-2xl font-bold capitalize ${
                  card.unhealthy ? "text-destructive" : "text-foreground"
                }`}
              >
                {card.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
