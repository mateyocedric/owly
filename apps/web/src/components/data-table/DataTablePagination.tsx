import React from "react";
import { Button } from "@owly/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DataTablePaginationProps } from "./types.js";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];

export function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[var(--sx-on-primary-mute)]">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange ? (
          <label className="flex items-center gap-2 text-xs text-[var(--sx-on-primary-mute)]">
            Rows
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="sx-field-on-dark h-8 w-auto py-1"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="h-8"
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <span className="px-2 text-xs text-[var(--sx-on-primary-mute)]">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="h-8"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
