import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@owly/ui";
import { Plus, Save, ShieldCheck, X } from "lucide-react";
import { AdminSection } from "../../../components/design/index.js";
import {
  DataTable,
  type ColumnDef,
} from "../../../components/data-table/index.js";
import {
  useBannedWordsQuery,
  useUpdateBannedWordsMutation,
} from "./hooks.js";
import { parseCommaSeparatedWords } from "./parse-words.js";

type WordRow = { word: string };

const columns: ColumnDef<WordRow>[] = [
  {
    id: "word",
    header: "Word",
    cell: (row) => <code className="text-sm text-foreground">{row.word}</code>,
  },
];

export function AdminWordsPage() {
  const { data: serverWords, isLoading, isError, error } =
    useBannedWordsQuery();
  const updateMutation = useUpdateBannedWordsMutation();
  const [words, setWords] = useState<string[]>([]);
  const [draftInput, setDraftInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    if (serverWords) {
      setWords(serverWords);
      setPage(1);
    }
  }, [serverWords]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseCommaSeparatedWords(draftInput);
    if (parsed.length === 0) return;

    const existing = new Set(words);
    const next = [...words];
    for (const word of parsed) {
      if (!existing.has(word)) {
        existing.add(word);
        next.push(word);
      }
    }
    setWords(next);
    setDraftInput("");
  };

  const handleRemove = (wordToRemove: string) => {
    setWords((prev) => prev.filter((w) => w !== wordToRemove));
  };

  const rows = useMemo(
    () => words.map((word) => ({ word })),
    [words]
  );
  const total = rows.length;
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error
          ? error.message
          : "Failed to load banned words."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <AdminSection
        title="Restricted words"
        description="Messages containing these words are blocked server-side. Add multiple words separated by commas."
      >
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ShieldCheck className="size-4 text-muted-foreground" />
            Bulk add
          </div>
          <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">
            Words (comma-separated)
          </label>
          <textarea
            value={draftInput}
            onChange={(e) => setDraftInput(e.target.value)}
            placeholder="word1, word2, word3, word4"
            rows={3}
            className="sx-field-on-dark"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" className="h-10 px-4">
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        </form>
      </AdminSection>

      <AdminSection
        title="Current list"
        description="Remove words locally, then save to apply"
        contentClassName="overflow-hidden p-0"
      >
        <DataTable<WordRow>
          columns={columns}
          data={pageRows}
          getRowId={(row) => row.word}
          isLoading={isLoading}
          emptyMessage="No custom banned words defined. Default safety patterns are active."
          className="rounded-none border-0"
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setPage(1);
            },
          }}
          rowActions={(row) => (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => handleRemove(row.word)}
            >
              <X className="size-3.5" />
              Remove
            </Button>
          )}
        />
        <div className="flex justify-end border-t border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)] px-3 py-3">
          <Button
            onClick={() => updateMutation.mutate(words)}
            disabled={updateMutation.isPending || isLoading}
            className="font-semibold"
          >
            <Save className="mr-1.5 h-4 w-4" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </AdminSection>
    </div>
  );
}
