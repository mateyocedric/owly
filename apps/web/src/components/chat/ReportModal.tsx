import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@owly/ui";
import { Flag, AlertTriangle } from "lucide-react";
import { REPORT_CATEGORIES, type ReportCategory } from "@owly/shared";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (category: ReportCategory, description?: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  spam: "Spam or Advertising",
  scam: "Scam or Phishing",
  sexual_exploitation: "Explicit / Inappropriate Sexual Content",
  threats: "Threats or Violence",
  hate_speech: "Hate Speech or Discrimination",
  doxxing: "Doxxing / Personal Info Sharing",
  personal_info_request: "Soliciting Personal Details",
  harassment: "Harassment or Bullying",
  underage: "Underage User (<18)",
  other: "Other Policy Violation",
};

export function ReportModal({ open, onOpenChange, onSubmit }: ReportModalProps) {
  const [category, setCategory] = useState<ReportCategory>("harassment");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(category, description);
    onOpenChange(false);
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-400 mb-1">
            <AlertTriangle className="h-5 w-5" />
            <DialogTitle>Report Chat Partner</DialogTitle>
          </div>
          <DialogDescription>
            Help keep Owly safe. Recent chat messages will be securely reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Reason for Report *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory)}
              className="w-full h-11 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {REPORT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat] || cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any helpful context..."
              rows={3}
              maxLength={500}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="bg-red-600 hover:bg-red-500"
            >
              <Flag className="h-4 w-4 mr-1.5" />
              Submit Report & End Chat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
