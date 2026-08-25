import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@owly/ui";
import { cn } from "@owly/ui/lib/utils";
import { DataTablePagination } from "./DataTablePagination.js";
import type { DataTableProps } from "./types.js";

export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  emptyMessage = "No results.",
  rowActions,
  pagination,
  className,
}: DataTableProps<T>) {
  const columnCount = columns.length + (rowActions ? 1 : 0);

  return (
    <div
      className={cn(
        "w-full min-w-0 overflow-hidden rounded-[var(--sx-rounded-sm)] border border-[var(--sx-hairline-on-dark)] bg-[var(--sx-canvas-night)]",
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-[var(--sx-hairline-on-dark)] hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(
                  "bg-[var(--sx-canvas-night-soft)] text-xs font-medium uppercase tracking-wider text-[var(--sx-on-primary-mute)]",
                  column.className
                )}
              >
                {column.header}
              </TableHead>
            ))}
            {rowActions ? (
              <TableHead className="bg-[var(--sx-canvas-night-soft)] text-right text-xs font-medium uppercase tracking-wider text-[var(--sx-on-primary-mute)]">
                Actions
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: pagination?.pageSize ?? 5 }).map((_, rowIdx) => (
              <TableRow
                key={`skeleton-${rowIdx}`}
                className="border-[var(--sx-hairline-on-dark)]"
              >
                {Array.from({ length: columnCount }).map((_, colIdx) => (
                  <TableCell key={`skeleton-${rowIdx}-${colIdx}`}>
                    <div className="h-4 w-full max-w-[8rem] animate-pulse rounded bg-[var(--sx-canvas-night-soft)]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow className="border-[var(--sx-hairline-on-dark)] hover:bg-transparent">
              <TableCell
                colSpan={columnCount}
                className="h-24 text-center text-sm text-[var(--sx-on-primary-mute)]"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={getRowId(row)}
                className="border-[var(--sx-hairline-on-dark)] hover:bg-[var(--sx-canvas-night-soft)]/80"
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn("text-[var(--sx-on-primary)]", column.className)}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
                {rowActions ? (
                  <TableCell className="text-right">{rowActions(row)}</TableCell>
                ) : null}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination ? <DataTablePagination {...pagination} /> : null}
    </div>
  );
}
