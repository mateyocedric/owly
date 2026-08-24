import React, { useState, useEffect } from "react";
import { Button, Input } from "@owly/ui";
import { LogOut, FileText, Users, Sliders } from "lucide-react";
import { apiFetch } from "../lib/api.js";
import { AdminDashboardMetrics } from "../components/admin/Dashboard.js";
import { ReportsList, type ReportItem } from "../components/admin/ReportsList.js";
import { UserManagement, type SessionItem } from "../components/admin/UserManagement.js";
import { BannedWordsConfig } from "../components/admin/BannedWords.js";
import { Seo } from "../components/Seo.js";
import {
  LightSurface,
  PageContainer,
  PagePanel,
  PanelHeader,
} from "../components/design/index.js";

export function AdminPage() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("owly_admin_token")
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"metrics" | "reports" | "users" | "config">("metrics");

  const [metrics, setMetrics] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalRooms: 0,
    pendingReports: 0,
    totalBans: 0,
  });

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await apiFetch<{ token: string }>("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setToken(res.token);
      localStorage.setItem("owly_admin_token", res.token);
    } catch (err: any) {
      setAuthError(err.message || "Invalid login credentials");
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("owly_admin_token");
  };

  useEffect(() => {
    if (!token) return;

    apiFetch<{ metrics: any }>("/admin/metrics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => setMetrics(data.metrics))
      .catch((err) => {
        if (err.message?.includes("Unauthorized")) handleLogout();
      });

    apiFetch<{ reports: ReportItem[] }>("/admin/reports?status=pending", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => setReports(data.reports))
      .catch(() => {});

    apiFetch<{ sessions: SessionItem[] }>("/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => setSessions(data.sessions))
      .catch(() => {});
  }, [token, activeTab]);

  const handleResolveReport = async (reportId: string, status: "resolved" | "dismissed") => {
    if (!token) return;
    try {
      await apiFetch(`/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      setReports(reports.filter((r) => r.id !== reportId));
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleBanUser = async (sessionId: string, reportId: string) => {
    if (!token) return;
    try {
      await apiFetch(`/admin/users/${sessionId}/moderate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          action: "permanent_ban",
          reason: `Report ${reportId.slice(-6)} verified violation`,
        }),
      });
      await handleResolveReport(reportId, "resolved");
      alert("User banned and report resolved.");
    } catch (err: any) {
      alert(`Ban failed: ${err.message}`);
    }
  };

  const handleModerateSession = async (sessionId: string, action: string, reason: string) => {
    if (!token) return;
    try {
      await apiFetch(`/admin/users/${sessionId}/moderate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, reason }),
      });
      alert("Moderation action applied successfully.");
    } catch (err: any) {
      alert(`Moderation failed: ${err.message}`);
    }
  };

  if (!token) {
    return (
      <PageContainer narrow>
        <Seo title="Staff Portal — Owly" path="/admin" noindex />
        <PagePanel>
          <PanelHeader title="Staff Login" description="Authorized personnel only" />
          <LightSurface>
            {authError ? (
              <p className="text-sm text-destructive">{authError}</p>
            ) : null}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="sx-label-cap-light mb-0 block">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="sx-label-cap-light mb-0 block">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>
          </LightSurface>
        </PagePanel>
      </PageContainer>
    );
  }

  const tabs = [
    { id: "metrics" as const, label: "Metrics", icon: FileText },
    { id: "reports" as const, label: `Reports (${reports.length})`, icon: FileText },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "config" as const, label: "Words", icon: Sliders },
  ];

  return (
    <PageContainer wide className="space-y-8">
      <Seo title="Staff Portal — Owly" path="/admin" noindex />
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--sx-hairline-on-dark)] pb-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <p className="sx-eyebrow">Staff</p>
          <h1 className="sx-display-page">Moderation Dashboard</h1>
          <p className="sx-caption">Platform metrics, reports, and safety controls</p>
        </div>
        <Button onClick={handleLogout} variant="outline" size="sm" className="self-start">
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[var(--sx-hairline-on-dark)] pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`sx-tab ${activeTab === id ? "sx-tab-active" : ""}`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <LightSurface>
        {activeTab === "metrics" && <AdminDashboardMetrics metrics={metrics} />}
        {activeTab === "reports" && (
          <ReportsList
            reports={reports}
            onResolve={handleResolveReport}
            onBanUser={handleBanUser}
          />
        )}
        {activeTab === "users" && (
          <UserManagement sessions={sessions} onModerate={handleModerateSession} />
        )}
        {activeTab === "config" && <BannedWordsConfig token={token} />}
      </LightSurface>
    </PageContainer>
  );
}
