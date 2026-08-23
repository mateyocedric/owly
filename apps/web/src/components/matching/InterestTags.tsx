import React, { useState, useEffect } from "react";
import { Badge, Button, Input } from "@owly/ui";
import { Plus, X, Tag } from "lucide-react";
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
        // Fallback default tags
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
      {/* Selected Tags Display */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Selected Topics ({selected.length}/{max})
          </label>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-zinc-900/60 border border-zinc-800 rounded-xl">
          {selected.length === 0 ? (
            <span className="text-xs text-zinc-400 my-auto px-2">
              No topics added yet. Add topics to match with people with shared interests.
            </span>
          ) : (
            selected.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="bg-violet-600/30 text-violet-200 border-violet-500/40 pl-3 pr-1.5 py-1 text-xs flex items-center gap-1.5"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="rounded-full p-0.5 hover:bg-violet-500/30 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Add Custom Tag */}
      {selected.length < max && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type custom topic (press enter)..."
              maxLength={30}
              className="w-full h-10 bg-zinc-900 border border-zinc-700/80 rounded-lg pl-9 pr-3 text-xs text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleAddTag(customInput)}
            disabled={!customInput.trim()}
            className="h-10 px-3 bg-zinc-800 text-zinc-200"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Popular Suggestions */}
      <div>
        <span className="text-xs text-zinc-400 block mb-2 font-medium">
          Popular Suggestions:
        </span>
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
                className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-full px-3 py-1 transition-colors disabled:opacity-40"
              >
                + {tag}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
