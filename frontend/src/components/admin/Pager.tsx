"use client";

interface PagerProps {
  page: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
  noun?: string;
}

export function Pager({ page, total, pageSize, onPage, noun = "item" }: PagerProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
      <span>
        {total} {noun}
        {total === 1 ? "" : "s"}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-cream-3 px-3 py-1.5 disabled:opacity-40"
        >
          Prev
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-cream-3 px-3 py-1.5 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
