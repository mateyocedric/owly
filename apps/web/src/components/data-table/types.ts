import type { ReactNode } from "react";

export type ColumnDef<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
};

export type DataTablePaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
};

export type DataTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  rowActions?: (row: T) => ReactNode;
  pagination?: DataTablePaginationProps;
  className?: string;
};
