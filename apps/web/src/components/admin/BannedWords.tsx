import React, { useState, useEffect } from "react";
import { Button, Input, Badge } from "@owly/ui";
import { ShieldCheck, Plus, X, Save } from "lucide-react";
import { apiFetch } from "../../lib/api.js";

interface BannedWordsProps {
  token: string;
}

export function BannedWordsConfig({ token }: BannedWordsProps) {
  const [words, setWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    apiFetch<{ words: string[] }>("/admin/config/banned-words", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => setWords(data.words || []))
      .catch(() => {});
  }, [token]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWord.trim().toLowerCase();
    if (!trimmed || words.includes(trimmed)) return;
    setWords([...words, trimmed]);
    setNewWord("");
  };

  const handleRemove = (wordToRemove: string) => {
    setWords(words.filter((w) => w !== wordToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage("");
    try {
      await apiFetch("/admin/config/banned-words", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ words }),
      });
      setStatusMessage("✅ Banned words successfully updated.");
    } catch (err: any) {
      setStatusMessage(`❌ Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-6">
      <div>
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-zinc-400" />
          Restricted Words & Safety Patterns
        </h4>
        <p className="text-xs text-zinc-400 mt-1">
          Messages containing any of these words will be blocked server-side before delivery.
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 max-w-md">
        <Input
          value={newWord}
          onChange={(e) => setNewWord(e.target.value)}
          placeholder="Add restricted word or term..."
          className="h-10 text-xs"
        />
        <Button type="submit" size="sm" className="h-10 px-4">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl">
        {words.length === 0 ? (
          <span className="text-xs text-zinc-400 my-auto">
            No custom banned words defined. Default safety patterns are active.
          </span>
        ) : (
          words.map((word) => (
            <Badge
              key={word}
              variant="destructive"
              className="pl-2.5 pr-1 py-1 text-xs flex items-center gap-1.5 bg-red-950/60 border-red-800/60 text-red-300"
            >
              {word}
              <button
                type="button"
                onClick={() => handleRemove(word)}
                className="hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-zinc-400">{statusMessage}</span>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="font-semibold"
        >
          <Save className="h-4 w-4 mr-1.5" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
