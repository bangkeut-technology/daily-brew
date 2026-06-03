export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (n: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 mt-3">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-glass-bg border border-cream-3 text-text-secondary cursor-pointer hover:bg-cream-3/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>
      <span className="text-[13px] text-text-tertiary tabular-nums">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-glass-bg border border-cream-3 text-text-secondary cursor-pointer hover:bg-cream-3/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
}
