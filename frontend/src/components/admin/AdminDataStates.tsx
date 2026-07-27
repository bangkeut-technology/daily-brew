"use client";

import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Loading and empty states shared by every admin list. Skeletons keep the page
 * height stable between "loading" and "loaded" so the table doesn't jump under
 * the cursor, which a centred "Loading…" line cannot do.
 */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-cream-3/70", className)} aria-hidden />;
}

// Deterministic ragged widths — bars of one constant width read as real (empty)
// values, whereas a ragged edge reads as "text is still coming".
const BAR_WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-1/3", "w-5/6", "w-7/12"];

export function TableSkeletonRows({ rows = 8, cols }: { rows?: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t border-cream-3/60">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <Skeleton className={cn("h-3", BAR_WIDTHS[(r + c) % BAR_WIDTHS.length])} />
              {r === 0 && c === 0 && <span className="sr-only">Loading</span>}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function CardSkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="space-y-2 rounded-xl border border-cream-3/60 bg-glass-bg px-4 py-3">
          <Skeleton className={cn("h-3.5", BAR_WIDTHS[r % BAR_WIDTHS.length])} />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Placeholder for the admin detail pages (user, workspace): back link, title,
 * then a grid of definition-list cards.
 */
export function DetailSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div aria-busy="true">
      <Skeleton className="mb-4 h-3 w-28" />
      <Skeleton className="mb-6 h-7 w-64" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-2xl border border-glass-border bg-glass-bg p-5 backdrop-blur-md"
          >
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface EmptyProps {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  hint?: ReactNode;
}

export function AdminEmpty({ icon: Icon, title, hint }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-10 text-center">
      <Icon size={22} className="text-text-tertiary/70" />
      <p className="text-sm text-text-secondary">{title}</p>
      {hint && <p className="max-w-sm text-xs leading-relaxed text-text-tertiary">{hint}</p>}
    </div>
  );
}

export function TableEmptyRow({ colSpan, ...props }: EmptyProps & { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <AdminEmpty {...props} />
      </td>
    </tr>
  );
}

/** Wraps a card in the mobile list so tap targets and padding stay consistent. */
export function MobileCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-cream-3/70 bg-glass-bg px-4 py-3 backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Label/value pair inside a mobile card. */
export function MobileField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[13px]">
      <span className="shrink-0 text-text-tertiary">{label}</span>
      <span className="min-w-0 truncate text-right text-text-secondary">{children}</span>
    </div>
  );
}

/**
 * Applied to every admin `<thead>` — long lists (the audit log paginates at 50)
 * scroll far enough that losing the column names makes rows unreadable.
 */
export const STICKY_HEAD =
  "sticky top-0 z-10 bg-cream-2 text-[12px] uppercase tracking-wide text-text-tertiary";

/** The scroll container every admin table lives in. */
export const TABLE_SCROLL = "max-h-[70vh] overflow-x-auto overflow-y-auto";
