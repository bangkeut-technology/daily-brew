"use client";

import { useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import type { GrowthPoint } from "@/types/admin";
import { GlassCard } from "@/components/shared/GlassCard";
import { cn } from "@/lib/utils";

type SeriesKey = "attendances" | "employees" | "workspaces" | "users";

// Hardcoded distinct hues. Don't reuse --color-coffee or --color-amber here —
// in dark mode the design tokens collapse them both to #E8A85A, which renders
// the employees and workspaces lines as one indistinguishable line.
const SERIES_META: { key: SeriesKey; label: string; color: string }[] = [
  { key: "attendances", label: "Attendances", color: "#4A7C59" }, // green
  { key: "employees", label: "Employees", color: "#E8A85A" }, // amber
  { key: "workspaces", label: "Workspaces", color: "#A26FB5" }, // purple — distinct in both modes
  { key: "users", label: "Users", color: "#3B6FA0" }, // blue
];

// The SVG draws in this coordinate space and stretches to the container;
// `vector-effect: non-scaling-stroke` keeps line weight uniform despite the
// non-uniform scale, and every label lives in HTML outside the SVG so nothing
// text-shaped gets distorted.
const VIEW_W = 600;
const VIEW_H = 220;

function niceCeiling(value: number): number {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

function formatChartDate(iso: string, withYear = false): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  // Constructed from parts, not `new Date(iso)` — the string form is parsed as
  // UTC and shifts the label a day backwards west of Greenwich.
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

export function GrowthChart({ series }: { series: GrowthPoint[] }) {
  const [active, setActive] = useState<Record<SeriesKey, boolean>>({
    attendances: true,
    employees: true,
    workspaces: true,
    users: true,
  });
  const [hover, setHover] = useState<number | null>(null);

  const visibleKeys = SERIES_META.filter((m) => active[m.key]);

  const max = useMemo(() => {
    const peak = series.reduce(
      (acc, point) => Math.max(acc, ...visibleKeys.map((m) => point[m.key])),
      0,
    );
    return niceCeiling(peak);
  }, [series, visibleKeys]);

  const ticks = [max, Math.round(max / 2), 0];

  // Guards every `i / span` below — a one-point (or empty) series would divide
  // by zero and NaN out the whole path.
  const span = Math.max(1, series.length - 1);

  const xAt = (i: number) => (i / span) * VIEW_W;
  const yAt = (v: number) => VIEW_H - (max === 0 ? 0 : (v / max) * VIEW_H);

  const pathFor = (key: SeriesKey) =>
    series.map((p, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(2)},${yAt(p[key]).toFixed(2)}`).join(" ");

  const hoveredPoint = hover !== null ? (series[hover] ?? null) : null;

  if (series.length === 0) return null;

  return (
    <GlassCard hover={false}>
      <div className="px-5 py-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-text-tertiary">
            <TrendingUp size={14} />
            <span className="text-[12.5px] font-medium uppercase tracking-wide">
              Growth · last 30 days
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {SERIES_META.map((m) => (
              <button
                key={m.key}
                type="button"
                aria-pressed={active[m.key]}
                onClick={() => setActive((s) => ({ ...s, [m.key]: !s[m.key] }))}
                className={cn(
                  "flex items-center gap-1.5 text-xs transition-opacity",
                  active[m.key] ? "opacity-100" : "opacity-40 hover:opacity-70",
                )}
              >
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: m.color }} />
                <span className="text-text-secondary">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative w-8 shrink-0" style={{ height: VIEW_H }} aria-hidden>
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute right-0 -translate-y-1/2 text-[10px] tabular-nums text-text-tertiary"
                style={{ top: `${((max - t) / (max || 1)) * 100}%` }}
              >
                {t}
              </span>
            ))}
          </div>

          <div
            className="relative min-w-0 flex-1"
            style={{ height: VIEW_H }}
            onMouseLeave={() => setHover(null)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              if (rect.width === 0) return;
              const ratio = (e.clientX - rect.left) / rect.width;
              setHover(Math.min(span, Math.max(0, Math.round(ratio * span))));
            }}
          >
            <svg
              width="100%"
              height={VIEW_H}
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              preserveAspectRatio="none"
              role="img"
              aria-label="Daily new users, workspaces, employees and attendances over the last 30 days"
            >
              {ticks.map((t) => (
                <line
                  key={t}
                  x1={0}
                  x2={VIEW_W}
                  y1={yAt(t)}
                  y2={yAt(t)}
                  stroke="var(--color-cream-3, #E8DFD3)"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {hover !== null && (
                <line
                  x1={xAt(hover)}
                  x2={xAt(hover)}
                  y1={0}
                  y2={VIEW_H}
                  stroke="var(--color-text-tertiary, #8B7E70)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {visibleKeys.map((m) => (
                <path
                  key={m.key}
                  d={pathFor(m.key)}
                  fill="none"
                  stroke={m.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}

              {hover !== null &&
                visibleKeys.map((m) => (
                  <circle
                    key={m.key}
                    cx={xAt(hover)}
                    cy={yAt(series[hover][m.key])}
                    r={3}
                    fill={m.color}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
            </svg>

            {hoveredPoint && hover !== null && (
              <div
                className="pointer-events-none absolute top-2 z-10 rounded-lg border border-glass-border bg-cream-1 px-3 py-2 text-xs shadow-sm"
                // Anchored from the right once the cursor passes the midpoint so
                // the card never runs off the edge of the chart.
                style={
                  hover / span > 0.5
                    ? { right: `${(1 - hover / span) * 100}%`, marginRight: 10 }
                    : { left: `${(hover / span) * 100}%`, marginLeft: 10 }
                }
              >
                <div className="mb-1 font-medium tabular-nums text-text-primary">
                  {formatChartDate(hoveredPoint.date, true)}
                </div>
                {SERIES_META.filter((m) => active[m.key]).map((m) => (
                  <div key={m.key} className="flex items-center gap-2 tabular-nums">
                    <span className="h-2 w-2 rounded-sm" style={{ background: m.color }} />
                    <span className="text-text-secondary">{m.label}</span>
                    <span className="ml-auto font-semibold text-text-primary">
                      {hoveredPoint[m.key].toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ml-10 mt-1.5 flex justify-between text-[10px] tabular-nums text-text-tertiary">
          <span>{formatChartDate(series[0]?.date ?? "")}</span>
          <span>{formatChartDate(series[Math.floor(series.length / 2)]?.date ?? "")}</span>
          <span>{formatChartDate(series[series.length - 1]?.date ?? "")}</span>
        </div>
      </div>
    </GlassCard>
  );
}
