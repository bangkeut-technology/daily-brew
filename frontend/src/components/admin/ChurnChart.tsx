"use client";

import { useState } from "react";
import { TrendingDown } from "lucide-react";
import type { AdminChurnPoint } from "@/types/admin";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";

// Hardcoded hues rather than design tokens: in dark mode coffee and amber both
// collapse to #E8A85A, which would make the series indistinguishable. The
// workspace purple and user blue match the growth chart's lines, so a thing
// keeps its colour across every chart in the admin section.
const SERIES: {
  key: keyof Omit<AdminChurnPoint, "month">;
  label: string;
  color: string;
  noun: [string, string];
}[] = [
  {
    key: "paidCanceled",
    label: "Paid cancellations",
    color: "#C0392B",
    noun: ["cancellation", "cancellations"],
  },
  {
    key: "workspacesDeleted",
    label: "Workspaces deleted",
    color: "#A26FB5",
    noun: ["workspace", "workspaces"],
  },
  {
    key: "usersDeleted",
    label: "Users deleted",
    color: "#3B6FA0",
    noun: ["account", "accounts"],
  },
];

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

function niceCeiling(value: number): number {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

/** "2026-08" → "Aug", with the year appended each January so the axis stays readable. */
function monthLabel(month: string): string {
  const [year, monthPart] = month.split("-");
  const name = MONTH_NAMES[Number(monthPart) - 1] ?? month;
  return monthPart === "01" ? `${name} ${year.slice(2)}` : name;
}

/** "Aug 2026" — the tooltip has room for the full month, the axis doesn't. */
function fullMonthLabel(month: string): string {
  const [year, monthPart] = month.split("-");
  return `${MONTH_NAMES[Number(monthPart) - 1] ?? month} ${year}`;
}

/** Screen-reader / fallback text for one column, e.g. "Aug 2026: 2 cancellations, 1 workspace". */
function describe(point: AdminChurnPoint): string {
  const parts = SERIES.filter((s) => point[s.key] > 0).map(
    (s) => `${point[s.key]} ${point[s.key] === 1 ? s.noun[0] : s.noun[1]}`,
  );
  return `${fullMonthLabel(point.month)}: ${parts.length > 0 ? parts.join(", ") : "no churn"}`;
}

/**
 * Twelve months of churn as grouped bars. Plain CSS heights rather than an SVG:
 * the series is short and fixed-length, so a flex row scales cleanly on a phone
 * without any of the non-uniform-scale text distortion an SVG would need to
 * work around.
 */
export function ChurnChart({ series }: { series: AdminChurnPoint[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (series.length === 0) return null;

  const peak = series.reduce(
    (acc, point) => Math.max(acc, ...SERIES.map((s) => point[s.key])),
    0,
  );
  const max = niceCeiling(peak);
  const heightPct = (value: number) => (max === 0 ? 0 : (value / max) * 100);
  const active = activeIndex === null ? null : series[activeIndex];

  return (
    // overflow-visible: the hover tooltip is anchored above the plot area and
    // GlassCard clips by default, which sliced the top off it (month heading +
    // first series row). It escapes upward over an earlier sibling card, so no
    // stacking-context surprises.
    <GlassCard hover={false} className="overflow-visible">
      <div className="px-5 py-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-text-tertiary">
            <TrendingDown size={14} />
            <span className="text-[12.5px] font-medium uppercase tracking-wide">
              Churn by month
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-text-secondary">
            {SERIES.map((s) => (
              <Legend key={s.key} color={s.color} label={s.label} />
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex w-6 flex-col justify-between py-0.5 text-right text-[11px] tabular-nums text-text-tertiary">
            <span>{max}</span>
            <span>{Math.round(max / 2)}</span>
            <span>0</span>
          </div>
          <div className="flex-1">
            <div className="relative h-[160px]" onMouseLeave={() => setActiveIndex(null)}>
              {[0, 50, 100].map((offset) => (
                <div
                  key={offset}
                  className="absolute left-0 right-0 border-t border-cream-3/70"
                  style={{ top: `${offset}%` }}
                />
              ))}
              <div className="absolute inset-0 flex items-end gap-1">
                {series.map((point, i) => (
                  <button
                    key={point.month}
                    type="button"
                    // The hit target is the whole month slot, not the 9px bars —
                    // otherwise the tooltip is near-impossible to open on a phone.
                    className="group relative flex h-full flex-1 cursor-default items-end justify-center gap-[2px] bg-transparent p-0 focus:outline-none"
                    aria-label={describe(point)}
                    onMouseEnter={() => setActiveIndex(i)}
                    onFocus={() => setActiveIndex(i)}
                    onBlur={() =>
                      setActiveIndex((current) => (current === i ? null : current))
                    }
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-0 rounded transition-colors",
                        activeIndex === i && "bg-cream-3/40",
                      )}
                    />
                    {SERIES.map((s) => (
                      <Bar key={s.key} color={s.color} heightPct={heightPct(point[s.key])} />
                    ))}
                  </button>
                ))}
              </div>

              {active && <Tooltip point={active} index={activeIndex!} count={series.length} />}
            </div>
            <div className="mt-1.5 flex gap-1">
              {series.map((point, i) => (
                <div
                  key={point.month}
                  className={cn(
                    "flex-1 text-center text-[10.5px] transition-colors",
                    activeIndex === i
                      ? "font-semibold text-text-secondary"
                      : "text-text-tertiary",
                  )}
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

function Bar({ color, heightPct }: { color: string; heightPct: number }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative w-full max-w-[9px] rounded-t-[3px] transition-all",
        heightPct === 0 && "opacity-40",
      )}
      style={{
        backgroundColor: color,
        // A zero month still gets a sliver so the column reads as "measured, empty".
        height: heightPct === 0 ? "2px" : `${heightPct}%`,
      }}
    />
  );
}

function Tooltip({
  point,
  index,
  count,
}: {
  point: AdminChurnPoint;
  index: number;
  count: number;
}) {
  // Flip the anchor near the edges so the card never hangs off the card body.
  const position = index < count / 6 ? "start" : index > (count * 5) / 6 ? "end" : "center";

  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute bottom-full z-20 mb-2 w-max rounded-xl border border-glass-border bg-cream-2 p-3 shadow-[0_6px_20px_rgba(107,66,38,0.16)]",
        position === "center" && "-translate-x-1/2",
        position === "end" && "-translate-x-full",
      )}
      style={{ left: `${((index + 0.5) / count) * 100}%` }}
    >
      <p className="mb-2 text-[13px] font-semibold text-text-primary">
        {fullMonthLabel(point.month)}
      </p>
      <ul className="space-y-1">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-[13px]">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="flex-1 whitespace-nowrap text-text-secondary">{s.label}</span>
            <span className="pl-3 font-mono tabular-nums text-text-primary">{point[s.key]}</span>
          </li>
        ))}
      </ul>
    </div>
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
