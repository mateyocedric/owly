import React, { useState, useEffect } from "react";
import { Input } from "@owly/ui";
import { Plus, X } from "lucide-react";
import { apiFetch } from "../../lib/api.js";

interface InterestTagsProps {
  selected: string[];
  onChange: (interests: string[]) => void;
  max?: number;
}

export function InterestTags({
  selected,
  onChange,
  max = 5,
}: InterestTagsProps) {
  const [customInput, setCustomInput] = useState("");
  const [popularTags, setPopularTags] = useState<string[]>([]);

  useEffect(() => {
    apiFetch<Array<{ name: string; slug: string }>>("/interests")
      .then((tags) => setPopularTags(tags.map((t) => t.name)))
      .catch(() => {
        setPopularTags([
          "Music",
          "Gaming",
          "Movies",
          "Tech",
          "Anime",
          "Books",
          "Coding",
          "Art",
          "Travel",
          "Sports",
        ]);
      });
  }, []);

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || selected.includes(trimmed) || selected.length >= max) return;
    onChange([...selected, trimmed]);
    setCustomInput("");
  };

  const handleRemoveTag = (tag: string) => {
    onChange(selected.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(customInput);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="sx-label-cap mb-0">
            Selected Topics ({selected.length}/{max})
          </label>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="sx-link-on-dark text-xs uppercase tracking-wider"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex min-h-[44px] flex-wrap gap-2 rounded-[var(--sx-rounded-xs)] border border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)] p-2">
          {selected.length === 0 ? (
            <span className="my-auto px-2 text-xs text-[var(--sx-on-primary-mute)]">
              No topics added yet.
            </span>
          ) : (
            selected.map((tag) => (
              <span key={tag} className="sx-chip gap-1.5 pr-1.5">
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="rounded-full p-0.5 text-[var(--sx-on-primary-mute)] hover:text-[var(--sx-on-primary)]"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {selected.length < max && (
        <div className="flex gap-2">
          <Input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type custom topic (press enter)..."
            maxLength={30}
            className="h-11 flex-1 rounded-[var(--sx-rounded-xs)] border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)] text-[var(--sx-on-primary)] shadow-none placeholder:text-white/40 focus-visible:border-[var(--sx-on-primary)] focus-visible:ring-0"
          />
          <button
            type="button"
            onClick={() => handleAddTag(customInput)}
            disabled={!customInput.trim()}
            aria-label="Add topic"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--sx-rounded-xs)] border border-[var(--sx-on-primary)] text-[var(--sx-on-primary)] transition-colors hover:bg-[var(--sx-on-primary)] hover:text-[var(--sx-canvas-night)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      )}

      <div>
        <span className="sx-label-cap mb-2 block">Popular Suggestions</span>
        <div className="flex flex-wrap gap-1.5">
          {popularTags
            .filter((t) => !selected.includes(t))
            .slice(0, 12)
            .map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                disabled={selected.length >= max}
                className="sx-chip cursor-pointer transition-colors hover:border-[var(--sx-on-primary)] hover:text-[var(--sx-on-primary)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                + {tag}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
