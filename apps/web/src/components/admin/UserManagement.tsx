import React, { useState } from "react";
import { Button, Input, Badge } from "@owly/ui";
import { ShieldBan, AlertCircle } from "lucide-react";

export interface SessionItem {
  id: string;
  status: string;
  ipHash: string;
  interests: string[];
  createdAt: string;
  lastActiveAt: string;
}

interface UserManagementProps {
  sessions: SessionItem[];
  onModerate: (sessionId: string, action: string, reason: string) => void;
}

export function UserManagement({ sessions, onModerate }: UserManagementProps) {
  const [targetId, setTargetId] = useState("");
  const [action, setAction] = useState("temporary_ban");
  const [reason, setReason] = useState("Violation of community guidelines");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId.trim()) return;
    onModerate(targetId.trim(), action, reason);
    setTargetId("");
  };

  return (
    <div className="space-y-6">
      {/* Manual Moderation Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-4"
      >
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldBan className="h-4 w-4 text-red-400" />
          Apply Moderation Action
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Session ID *</label>
            <Input
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder="Paste session ObjectId..."
              required
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Action *</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full h-11 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="warning">Issue Warning</option>
              <option value="temporary_ban">Temporary Ban (24h)</option>
              <option value="permanent_ban">Permanent Ban</option>
              <option value="unban">Unban Session</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Reason *</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for audit log..."
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="destructive" size="sm">
            Execute Action
          </Button>
        </div>
      </form>

      {/* Recent Sessions Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
            <tr>
              <th className="p-3">Session ID</th>
              <th className="p-3">Status</th>
              <th className="p-3">IP Hash</th>
              <th className="p-3">Interests</th>
              <th className="p-3">Last Active</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-zinc-800/30">
                <td className="p-3 text-zinc-200">{s.id.slice(-8)}</td>
                <td className="p-3 font-sans">
                  <Badge
                    variant={
                      s.status === "active"
                        ? "success"
                        : s.status === "warned"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {s.status}
                  </Badge>
                </td>
                <td className="p-3 text-zinc-400">{s.ipHash.slice(0, 10)}...</td>
                <td className="p-3 font-sans text-zinc-300">
                  {s.interests?.length ? s.interests.join(", ") : "—"}
                </td>
                <td className="p-3 text-zinc-400">
                  {new Date(s.lastActiveAt).toLocaleTimeString()}
                </td>
                <td className="p-3 text-right font-sans">
                  <button
                    onClick={() => {
                      setTargetId(s.id);
                    }}
                    className="text-violet-400 hover:text-violet-300 underline text-xs"
                  >
                    Select
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
