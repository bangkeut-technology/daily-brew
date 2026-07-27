import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Loading and empty states shared by every admin list. Skeletons keep the page
 * height stable between "loading" and "loaded" so the table doesn't jump under
 * the cursor, which a centred "Loading…" line cannot do.
 */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-cream-3/70', className)} aria-hidden />;
}

// Deterministic ragged widths — bars of one constant width read as real (empty)
// values, whereas a ragged edge reads as "text is still coming".
const BAR_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-1/3', 'w-5/6', 'w-7/12'];

export function TableSkeletonRows({ rows = 8, cols }: { rows?: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t border-cream-3/60">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <Skeleton className={cn('h-3', BAR_WIDTHS[(r + c) % BAR_WIDTHS.length])} />
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
        <div key={r} className="rounded-xl border border-cream-3/60 bg-glass-bg px-4 py-3 space-y-2">
          <Skeleton className={cn('h-3.5', BAR_WIDTHS[r % BAR_WIDTHS.length])} />
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
      <Skeleton className="h-3 w-28 mb-4" />
      <Skeleton className="h-7 w-64 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-md p-5 space-y-3"
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
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  hint?: ReactNode;
}

export function AdminEmpty({ icon: Icon, title, hint }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-10 text-center">
      <Icon size={22} className="text-text-tertiary/70" />
      <p className="text-[14px] text-text-secondary">{title}</p>
      {hint && <p className="text-[12.5px] text-text-tertiary max-w-sm leading-relaxed">{hint}</p>}
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
        'rounded-xl border border-cream-3/70 bg-glass-bg backdrop-blur-md px-4 py-3',
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
      <span className="text-text-tertiary shrink-0">{label}</span>
      <span className="text-text-secondary text-right min-w-0 truncate">{children}</span>
    </div>
  );
}

/**
 * Applied to every admin `<thead>` — long lists (the audit log paginates at 50)
 * scroll far enough that losing the column names makes rows unreadable.
 */
export const STICKY_HEAD =
  'sticky top-0 z-10 bg-cream-2 text-text-tertiary text-[12px] uppercase tracking-wide';
