import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FileText, LogOut, Sliders, Users } from "lucide-react";
import { useSessionQuery } from "../../client/hooks/useSessionQuery.js";
import { useSignOutMutation } from "../../client/hooks/useSignOutMutation.js";
import { Seo } from "../../components/Seo.js";
import {
  DarkSurface,
  GhostButton,
  PageContainer,
  PagePanel,
} from "../../components/design/index.js";
import { AdminSignIn } from "./components/sign-in/index.js";

const navItems = [
  { to: "/admin/metrics", label: "Metrics", icon: FileText },
  { to: "/admin/reports", label: "Reports", icon: FileText },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/words", label: "Words", icon: Sliders },
] as const;

export function AdminLayout() {
  const { data: session, isPending } = useSessionQuery();
  const signOutMutation = useSignOutMutation();

  if (isPending) {
    return (
      <PageContainer narrow>
        <Seo title="Staff Portal — Owly" path="/admin" noindex />
        <PagePanel>
          <DarkSurface>
            <p className="sx-caption">Checking session…</p>
          </DarkSurface>
        </PagePanel>
      </PageContainer>
    );
  }

  if (!session || session.status !== "authenticated") {
    return <AdminSignIn />;
  }

  return (
    <PageContainer wide className="space-y-2">
      <Seo title="Staff Portal — Owly" path="/admin" noindex />
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--sx-hairline-on-dark)] pb-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <p className="sx-eyebrow">Staff</p>
          <h1 className="sx-display-page">Moderation Dashboard</h1>
          <p className="sx-caption">
            Platform metrics, reports, and safety controls
          </p>
        </div>
        <GhostButton
          onClick={() => signOutMutation.mutate()}
          className="inline-flex shrink-0 items-center gap-2 self-start"
          disabled={signOutMutation.isPending}
        >
          <LogOut className="size-4" />
          Sign Out
        </GhostButton>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[var(--sx-hairline-on-dark)] pb-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sx-tab ${isActive ? "sx-tab-active" : ""}`
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </div>

      <DarkSurface className="space-y-6">
        <Outlet />
      </DarkSurface>
    </PageContainer>
  );
}
