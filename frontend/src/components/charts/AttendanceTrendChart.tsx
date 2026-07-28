"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { TrendDay } from "@/types/dashboard";
import { ATTENDANCE_SERIES, CHART_GRID, CHART_MUTED, weekdayLabels } from "./chartTokens";
import { ChartLegend } from "./ChartLegend";
import { ChartViewToggle } from "./ChartViewToggle";

const PLOT_HEIGHT = 168;
/** The surface gap that separates touching stacked segments. */
const SEGMENT_GAP = 2;
/** Floor so a one-person segment never vanishes on a big team. */
const MIN_SEGMENT = 3;
const MAX_BAR_WIDTH = 24;

interface Props {
  daily: TrendDay[];
  /** Workspace-formatted date, used in the tooltip and the table view. */
  formatDate: (isoDate: string) => string;
  locale: string;
  /** Dim the plot while a wider/narrower range is still loading. */
  isStale?: boolean;
}

export function AttendanceTrendChart({ daily, formatDate, locale, isStale }: Props) {
  const { t } = useTranslation();
  const [view, setView] = useState<"chart" | "table">("chart");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const weekdays = useMemo(() => weekdayLabels(locale, "narrow"), [locale]);
  // Screen-reader / title text for one column, e.g. "3 on time, 1 late".
  const describe = useCallback(
    (day: TrendDay) => {
      if (day.closed) return t("charts.closedShort", "Closed");
      const parts = ATTENDANCE_SERIES.filter((s) => day[s.key] > 0).map(
        (s) => `${day[s.key]} ${t(s.i18nKey, s.defaultLabel).toLowerCase()}`,
      );
      return parts.length > 0 ? parts.join(", ") : t("charts.noRecords", "No records");
    },
    [t],
  );
  // One scale for every column so heights stay comparable across the window.
  const max = useMemo(
    () => Math.max(1, ...daily.map((d) => d.onTime + d.late + d.leave + d.absent)),
    [daily],
  );
  // Label every column while there's room, then thin out to keep the axis legible.
  const labelEvery = daily.length <= 14 ? 1 : daily.length <= 21 ? 2 : 5;
  // Weekday initials only make sense over a single week — across two they
  // repeat (S, S, M, T…) and stop identifying anything.
  const useWeekdayLabels = daily.length <= 7;

  if (daily.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-[15px] text-text-tertiary">
        {t("charts.noTrendData", "No attendance history in this range yet.")}
      </p>
    );
  }

  const active = activeIndex === null ? null : daily[activeIndex];

  return (
    <div className="px-5 pb-5 pt-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ChartLegend series={ATTENDANCE_SERIES} />
        <ChartViewToggle view={view} onChange={setView} />
      </div>

      {view === "table" ? (
        <TrendTable daily={daily} formatDate={formatDate} />
      ) : (
        <div className={cn("transition-opacity duration-200", isStale && "opacity-50")}>
          <div className="flex gap-2">
            <YAxis max={max} />

            <div className="relative min-w-0 flex-1">
              <Gridlines />

              <div
                className="relative flex items-end gap-[3px]"
                style={{ height: PLOT_HEIGHT }}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {daily.map((day, i) => (
                  <Column
                    key={day.date}
                    day={day}
                    max={max}
                    isActive={activeIndex === i}
                    label={dayNumber(day.date)}
                    onActivate={() => setActiveIndex(i)}
                    onDeactivate={() => setActiveIndex((current) => (current === i ? null : current))}
                    tooltipLabel={`${formatDate(day.date)} — ${describe(day)}`}
                  />
                ))}

                {active && (
                  <Tooltip
                    day={active}
                    index={activeIndex!}
                    count={daily.length}
                    formatDate={formatDate}
                  />
                )}
              </div>

              <div className="mt-2 flex gap-[3px]">
                {daily.map((day, i) => {
                  const isLast = i === daily.length - 1;
                  const show = isLast || i % labelEvery === 0;
                  return (
                    <div key={day.date} className="min-w-0 flex-1 text-center">
                      {show && (
                        <span
                          className={cn(
                            "text-[11px] tabular-nums",
                            isLast ? "font-semibold text-text-secondary" : "text-text-tertiary",
                          )}
                        >
                          {useWeekdayLabels ? weekdays[day.dayOfWeek - 1] : dayNumber(day.date)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Column({
  day,
  max,
  label,
  isActive,
  onActivate,
  onDeactivate,
  tooltipLabel,
}: {
  day: TrendDay;
  max: number;
  label: string;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  tooltipLabel: string;
}) {
  const segments = ATTENDANCE_SERIES.map((series) => ({
    series,
    value: day[series.key],
    height: Math.max(MIN_SEGMENT, Math.round((day[series.key] / max) * PLOT_HEIGHT)),
  })).filter((s) => s.value > 0);

  return (
    <button
      type="button"
      // The hit target is the whole column slot, not the bar — a 6px-wide
      // 30-day column would otherwise be near-impossible to hover.
      className="group relative h-full min-w-0 flex-1 cursor-default bg-transparent p-0 focus:outline-none"
      aria-label={tooltipLabel}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
    >
      <span
        className={cn(
          "absolute inset-0 rounded transition-colors",
          isActive && "bg-cream-3/40",
        )}
      />
      <span
        className="relative mx-auto flex h-full w-full flex-col justify-end"
        style={{ maxWidth: MAX_BAR_WIDTH }}
      >
        {segments.length === 0 ? (
          <span
            className="w-full rounded-[1px]"
            style={{ height: day.closed ? 4 : 2, backgroundColor: CHART_MUTED }}
          />
        ) : (
          // Rendered top-down so the DOM order matches what the reader sees;
          // the stack order itself is bottom-up (on time on the baseline).
          [...segments].reverse().map((segment, i) => (
            <span
              key={segment.series.key}
              className="w-full"
              style={{
                height: segment.height,
                backgroundColor: segment.series.color,
                // Only the top of the whole stack gets the rounded data-end;
                // the baseline end stays square.
                borderTopLeftRadius: i === 0 ? 4 : 0,
                borderTopRightRadius: i === 0 ? 4 : 0,
                marginTop: i === 0 ? 0 : SEGMENT_GAP,
              }}
            />
          ))
        )}
      </span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

function Tooltip({
  day,
  index,
  count,
  formatDate,
}: {
  day: TrendDay;
  index: number;
  count: number;
  formatDate: (isoDate: string) => string;
}) {
  const { t } = useTranslation();
  // Flip the anchor near the edges so the card never hangs off the card body.
  const position = index < count / 6 ? "start" : index > (count * 5) / 6 ? "end" : "center";
  const rows = ATTENDANCE_SERIES.filter((series) => day[series.key] > 0);

  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute bottom-full z-20 mb-2 w-max max-w-56 rounded-xl border border-glass-border bg-cream-2 p-3 shadow-[0_6px_20px_rgba(107,66,38,0.16)]",
        position === "center" && "-translate-x-1/2",
        position === "end" && "-translate-x-full",
      )}
      style={{ left: `${((index + 0.5) / count) * 100}%` }}
    >
      <p className="mb-2 text-[13px] font-semibold text-text-primary">{formatDate(day.date)}</p>
      {day.closed ? (
        <p className="text-[13px] text-text-secondary">{t("charts.closedDay", "Closed — nobody expected")}</p>
      ) : rows.length === 0 ? (
        <p className="text-[13px] text-text-secondary">{t("charts.noRecords", "No records")}</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((series) => (
            <li key={series.key} className="flex items-center gap-2 text-[13px]">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: series.color }}
              />
              <span className="flex-1 text-text-secondary">{t(series.i18nKey, series.defaultLabel)}</span>
              <span className="font-mono tabular-nums text-text-primary">{day[series.key]}</span>
            </li>
          ))}
        </ul>
      )}
      {!day.closed && day.expected > 0 && (
        <p className="mt-2 border-t border-cream-3 pt-2 text-[12.5px] text-text-tertiary">
          {t("charts.tooltipRates", {
            attendance: day.attendanceRate,
            onTime: day.onTimeRate,
            defaultValue: "{{attendance}}% in · {{onTime}}% on time",
          })}
        </p>
      )}
    </div>
  );
}

function YAxis({ max }: { max: number }) {
  const mid = Math.round(max / 2);
  return (
    <div
      className="relative w-6 shrink-0 text-right text-[11px] tabular-nums text-text-tertiary"
      style={{ height: PLOT_HEIGHT }}
      aria-hidden
    >
      <span className="absolute right-0 top-0 -translate-y-1/2">{max}</span>
      {mid !== max && mid !== 0 && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2">{mid}</span>
      )}
      <span className="absolute bottom-0 right-0 translate-y-1/2">0</span>
    </div>
  );
}

function Gridlines() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: PLOT_HEIGHT }} aria-hidden>
      {[0, 50, 100].map((pct) => (
        <span
          key={pct}
          className="absolute inset-x-0 h-px"
          style={{ top: `${pct}%`, backgroundColor: CHART_GRID }}
        />
      ))}
    </div>
  );
}

/** The WCAG-clean twin of the chart — every plotted value is readable here too. */
function TrendTable({
  daily,
  formatDate,
}: {
  daily: TrendDay[];
  formatDate: (isoDate: string) => string;
}) {
  const { t } = useTranslation();
  return (
    <div className="max-h-[220px] overflow-auto rounded-xl border border-cream-3/70">
      <table className="w-full text-[13px]">
        <thead className="sticky top-0 bg-cream-2">
          <tr className="text-left text-text-secondary">
            <th scope="col" className="px-3 py-2 font-medium">{t("charts.date", "Date")}</th>
            {ATTENDANCE_SERIES.map((series) => (
              <th key={series.key} scope="col" className="px-2 py-2 text-right font-medium">
                {t(series.i18nKey, series.defaultLabel)}
              </th>
            ))}
            <th scope="col" className="px-3 py-2 text-right font-medium">
              {t("charts.attendanceRate", "Rate")}
            </th>
          </tr>
        </thead>
        <tbody>
          {daily.map((day) => (
            <tr key={day.date} className="border-t border-cream-3/60">
              <th scope="row" className="whitespace-nowrap px-3 py-1.5 text-left font-normal text-text-primary">
                {formatDate(day.date)}
              </th>
              {ATTENDANCE_SERIES.map((series) => (
                <td key={series.key} className="px-2 py-1.5 text-right font-mono tabular-nums text-text-secondary">
                  {day[series.key]}
                </td>
              ))}
              <td className="px-3 py-1.5 text-right font-mono tabular-nums text-text-secondary">
                {day.closed ? t("charts.closedShort", "Closed") : day.expected > 0 ? `${day.attendanceRate}%` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function dayNumber(isoDate: string): string {
  return String(Number(isoDate.slice(8, 10)));
}
