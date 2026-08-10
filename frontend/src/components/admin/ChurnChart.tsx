"use client";

import { TrendingDown } from "lucide-react";
import type { AdminChurnPoint } from "@/types/admin";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";

// Hardcoded hues rather than design tokens: in dark mode coffee and amber both
// collapse to #E8A85A, which would make the two series indistinguishable.
const CANCELED_COLOR = "#C0392B"; // red — lost revenue
const DELETED_COLOR = "#A26FB5"; // purple — lost account, distinct in both modes

function niceCeiling(value: number): number {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2026-08" → "Aug", with the year appended each January so the axis stays readable. */
function monthLabel(month: string): string {
  const [year, monthPart] = month.split("-");
  const name = MONTH_NAMES[Number(monthPart) - 1] ?? month;
  return monthPart === "01" ? `${name} ${year.slice(2)}` : name;
}

/**
 * Twelve months of churn as grouped bars. Plain CSS heights rather than an SVG:
 * the series is short and fixed-length, so a flex row scales cleanly on a phone
 * without any of the non-uniform-scale text distortion an SVG would need to
 * work around.
 */
export function ChurnChart({ series }: { series: AdminChurnPoint[] }) {
  if (series.length === 0) return null;

  const peak = series.reduce(
    (acc, point) => Math.max(acc, point.paidCanceled, point.workspacesDeleted),
    0,
  );
  const max = niceCeiling(peak);
  const heightPct = (value: number) => (max === 0 ? 0 : (value / max) * 100);

  return (
    <GlassCard hover={false}>
      <div className="px-5 py-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-text-tertiary">
            <TrendingDown size={14} />
            <span className="text-[12.5px] font-medium uppercase tracking-wide">
              Churn by month
            </span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-text-secondary">
            <Legend color={CANCELED_COLOR} label="Paid cancellations" />
            <Legend color={DELETED_COLOR} label="Workspaces deleted" />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex w-6 flex-col justify-between py-0.5 text-right text-[11px] tabular-nums text-text-tertiary">
            <span>{max}</span>
            <span>{Math.round(max / 2)}</span>
            <span>0</span>
          </div>
          <div className="flex-1">
            <div className="relative h-[160px]">
              {[0, 50, 100].map((offset) => (
                <div
                  key={offset}
                  className="absolute left-0 right-0 border-t border-cream-3/70"
                  style={{ top: `${offset}%` }}
                />
              ))}
              <div className="absolute inset-0 flex items-end gap-1.5">
                {series.map((point) => (
                  <div key={point.month} className="flex h-full flex-1 items-end justify-center gap-[3px]">
                    <Bar
                      color={CANCELED_COLOR}
                      heightPct={heightPct(point.paidCanceled)}
                      title={`${monthLabel(point.month)}: ${point.paidCanceled} paid cancellation${point.paidCanceled === 1 ? "" : "s"}`}
                    />
                    <Bar
                      color={DELETED_COLOR}
                      heightPct={heightPct(point.workspacesDeleted)}
                      title={`${monthLabel(point.month)}: ${point.workspacesDeleted} workspace${point.workspacesDeleted === 1 ? "" : "s"} deleted`}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-1.5 flex gap-1.5">
              {series.map((point) => (
                <div
                  key={point.month}
                  className="flex-1 text-center text-[10.5px] text-text-tertiary"
                >
                  {monthLabel(point.month)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function Bar({ color, heightPct, title }: { color: string; heightPct: number; title: string }) {
  return (
    <div
      title={title}
      className={cn("w-full max-w-[10px] rounded-t-[3px] transition-all", heightPct === 0 && "opacity-40")}
      style={{
        backgroundColor: color,
        // A zero month still gets a sliver so the column reads as "measured, empty".
        height: heightPct === 0 ? "2px" : `${heightPct}%`,
      }}
    />
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
