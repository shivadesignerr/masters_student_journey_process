import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Loader2 } from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";
import { EmptyState } from "./empty-state";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  searchPlaceholder?: string;
  searchFilter?: (row: T, query: string) => boolean;
  pageSize?: number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  headerAction?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  searchPlaceholder = "Search records...",
  searchFilter,
  pageSize = 10,
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search filters or check back later.",
  onRowClick,
  headerAction,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortAsc, setSortAsc] = React.useState(true);

  // Filter
  const filteredData = React.useMemo(() => {
    if (!searchFilter || !search.trim()) return data;
    return data.filter((row) => searchFilter(row, search.trim().toLowerCase()));
  }, [data, search, searchFilter]);

  // Sort
  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      return (aVal < bVal ? -1 : 1) * (sortAsc ? 1 : -1);
    });
  }, [filteredData, sortKey, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {searchFilter ? (
          <div className="w-full sm:w-72">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              icon={<Search className="w-4 h-4 text-gvk-text-muted" />}
              inputSize="sm"
            />
          </div>
        ) : (
          <div />
        )}
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-gvk-border bg-white overflow-hidden shadow-level-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gvk-border bg-gvk-surface-secondary text-gvk-text-secondary font-semibold">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      "py-3 px-4 uppercase tracking-wider text-[11px]",
                      col.sortable && "cursor-pointer hover:text-gvk-navy select-none",
                      col.className
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <ArrowUpDown className="w-3 h-3 text-gvk-text-muted hover:text-gvk-navy" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gvk-border/70 text-gvk-text-primary">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-gvk-text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gvk-navy" />
                    <span>Loading data records...</span>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr
                    key={keyExtractor(row)}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      "transition-colors duration-micro hover:bg-gvk-surface-hover",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn("py-3 px-4", col.className)}>
                        {col.render ? col.render(row) : (row as any)[col.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-8">
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!isLoading && sortedData.length > pageSize && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gvk-border bg-gvk-surface-secondary/50 text-xs text-gvk-text-secondary">
            <span>
              Showing <strong className="text-gvk-text-primary font-semibold">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
              <strong className="text-gvk-text-primary font-semibold">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </strong>{" "}
              of <strong className="text-gvk-text-primary font-semibold">{sortedData.length}</strong> records
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="px-2 text-xs font-semibold text-gvk-navy">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
