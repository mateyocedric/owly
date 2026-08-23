import React, { useState, useEffect } from "react";
import { Badge, Button, Input } from "@owly/ui";
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
          <label className="sx-label-cap-light mb-0">
            Selected Topics ({selected.length}/{max})
          </label>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-muted-foreground underline underline-offset-2"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex min-h-[44px] flex-wrap gap-2 rounded-md border border-border bg-muted/30 p-2">
          {selected.length === 0 ? (
            <span className="my-auto px-2 text-xs text-muted-foreground">
              No topics added yet.
            </span>
          ) : (
            selected.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1.5 pl-3 pr-1.5">
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
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
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleAddTag(customInput)}
            disabled={!customInput.trim()}
            aria-label="Add topic"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      )}

      <div>
        <span className="sx-label-cap-light mb-2 block">Popular Suggestions</span>
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
                className="rounded-full border border-border px-3 py-1 text-xs transition-colors hover:bg-muted disabled:opacity-40"
              >
                + {tag}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
