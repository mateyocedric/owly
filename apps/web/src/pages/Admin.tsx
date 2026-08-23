import React, { useState, useEffect } from "react";
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "@owly/ui";
import { Lock, ShieldAlert, LogOut, FileText, Users, Sliders } from "lucide-react";
import { apiFetch } from "../lib/api.js";
import { AdminDashboardMetrics } from "../components/admin/Dashboard.js";
import { ReportsList, type ReportItem } from "../components/admin/ReportsList.js";
import { UserManagement, type SessionItem } from "../components/admin/UserManagement.js";
import { BannedWordsConfig } from "../components/admin/BannedWords.js";

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

  // Fetch admin data
  useEffect(() => {
    if (!token) return;

    // Fetch metrics
    apiFetch<{ metrics: any }>("/admin/metrics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => setMetrics(data.metrics))
      .catch((err) => {
        if (err.message?.includes("Unauthorized")) handleLogout();
      });

    // Fetch reports
    apiFetch<{ reports: ReportItem[] }>("/admin/reports?status=pending", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => setReports(data.reports))
      .catch(() => {});

    // Fetch sessions
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

  // If not logged in, show Login Screen
  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="glass-panel rounded-2xl p-8 space-y-6 shadow-2xl border border-zinc-800">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Staff Moderation Login</h2>
            <p className="text-xs text-zinc-400">Authorized personnel only</p>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold h-11">
              Sign In to Moderation Panel
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard UI
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-violet-400" />
            Moderation Dashboard
          </h2>
          <p className="text-xs text-zinc-400">
            Real-time platform metrics, report reviews, and safety pattern controls
          </p>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="border-zinc-700 text-zinc-300 self-start sm:self-auto"
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          Sign Out
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab("metrics")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "metrics"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <FileText className="h-4 w-4" />
          Overview Metrics
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "reports"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          Reports Queue ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "users"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Users className="h-4 w-4" />
          User & Ban Controls
        </button>

        <button
          onClick={() => setActiveTab("config")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "config"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Sliders className="h-4 w-4" />
          Restricted Words
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "metrics" && <AdminDashboardMetrics metrics={metrics} />}
      {activeTab === "reports" && (
        <ReportsList
          reports={reports}
          onResolve={handleResolveReport}
          onBanUser={handleBanUser}
        />
      )}
      {activeTab === "users" && (
        <UserManagement
          sessions={sessions}
          onModerate={handleModerateSession}
        />
      )}
      {activeTab === "config" && <BannedWordsConfig token={token} />}
    </div>
  );
}
