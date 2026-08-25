import React, { useEffect, useState } from "react";
import { Button, Input } from "@owly/ui";
import { ShieldBan } from "lucide-react";

interface ModerationFormProps {
  initialSessionId?: string;
  onModerate: (sessionId: string, action: string, reason: string) => void;
  isPending?: boolean;
}

export function ModerationForm({
  initialSessionId = "",
  onModerate,
  isPending = false,
}: ModerationFormProps) {
  const [targetId, setTargetId] = useState(initialSessionId);
  const [action, setAction] = useState("temporary_ban");
  const [reason, setReason] = useState("Violation of community guidelines");

  useEffect(() => {
    if (initialSessionId) {
      setTargetId(initialSessionId);
    }
  }, [initialSessionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId.trim()) return;
    onModerate(targetId.trim(), action, reason);
    setTargetId("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <ShieldBan className="size-4 text-destructive" />
        Choose a session and action
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Session ID *
          </label>
          <Input
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="Paste session ObjectId..."
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Action *
          </label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="sx-field-on-dark h-11"
          >
            <option value="warning">Issue Warning</option>
            <option value="temporary_ban">Temporary Ban (24h)</option>
            <option value="permanent_ban">Permanent Ban</option>
            <option value="unban">Unban Session</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Reason *
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for audit log..."
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="destructive"
          size="sm"
          disabled={isPending}
        >
          Execute Action
        </Button>
      </div>
    </form>
  );
}
