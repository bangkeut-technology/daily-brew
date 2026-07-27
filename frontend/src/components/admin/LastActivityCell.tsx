"use client";

import { formatAdminDate } from "@/lib/adminDate";
import { cn } from "@/lib/utils";

/**
 * Whole days between a workspace-local `YYYY-MM-DD` and today. Both sides are
 * pinned to UTC midnight so the subtraction can't be thrown off by the
 * viewer's offset; a freshness badge doesn't need sub-day precision.
 */
function daysSince(dateStr: string): number | null {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  const then = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - then) / 86_400_000);
}

function relativeLabel(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/**
 * Last check-in for a workspace, with a freshness colour: green inside a week,
 * amber inside a month, muted beyond that. This is the fastest read on whether
 * an account is alive — plan and employee count say nothing about usage.
 */
export function LastActivityCell({
  date,
  className,
}: {
  date: string | null;
  className?: string;
}) {
  if (!date) {
    return (
      <span className={cn("text-[12.5px] text-text-tertiary", className)}>
        Never used
      </span>
    );
  }

  const days = daysSince(date);
  const tone =
    days === null
      ? "text-text-tertiary"
      : days <= 7
        ? "text-green"
        : days <= 30
          ? "text-amber"
          : "text-text-tertiary";

  return (
    <span className={cn("flex flex-col leading-tight", className)}>
      <span className={cn("text-[13px] font-medium tabular-nums", tone)}>
        {days === null ? formatAdminDate(date) : relativeLabel(days)}
      </span>
      <span className="text-[11.5px] text-text-tertiary tabular-nums">
        {formatAdminDate(date)}
      </span>
    </span>
  );
}
