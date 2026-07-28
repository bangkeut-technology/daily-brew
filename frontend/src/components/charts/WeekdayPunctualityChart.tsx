"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { TrendWeekday } from "@/types/dashboard";
import { CHART_MUTED, weekdayLabels } from "./chartTokens";

/**
 * On-time rate per weekday — the chart that answers "is Monday morning our
 * problem?". One series, so no legend: the card title names what's plotted,
 * and every bar carries its own value at the tip.
 *
 * The worst day is the story, so it gets the accent and the rest recede
 * (emphasis, not a categorical palette that would make seven equal claims).
 */
export function WeekdayPunctualityChart({
  byWeekday,
  locale,
  isStale,
}: {
  byWeekday: TrendWeekday[];
  locale: string;
  isStale?: boolean;
}) {
  const { t } = useTranslation();
  const labels = useMemo(() => weekdayLabels(locale), [locale]);

  const withData = byWeekday.filter((d) => d.hasData);
  if (withData.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-[15px] text-text-tertiary">
        {t("charts.noWeekdayData", "Not enough history to compare weekdays yet.")}
      </p>
    );
  }

  // Only call out a worst day once there's something to compare it against.
  const worstRate = Math.min(...withData.map((d) => d.onTimeRate));
  const worstDay = withData.length > 1 && worstRate < 100 ? worstRate : null;

  return (
    <div className={cn("space-y-2 px-5 pb-5 pt-4 transition-opacity duration-200", isStale && "opacity-50")}>
      {byWeekday.map((day) => {
        const isWorst = day.hasData && worstDay !== null && day.onTimeRate === worstDay;
        return (
          <div key={day.dayOfWeek} className="flex items-center gap-3">
            <span className="w-9 shrink-0 text-[12.5px] text-text-tertiary">
              {labels[day.dayOfWeek - 1]}
            </span>
            <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-cream-3/60">
              {day.hasData && (
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(day.onTimeRate, 1)}%`,
                    backgroundColor: isWorst ? "var(--db-chart-late)" : "var(--db-chart-ontime)",
                  }}
                />
              )}
            </div>
            <span
              className={cn(
                "w-24 shrink-0 text-right text-[12.5px] tabular-nums",
                isWorst ? "font-semibold text-text-primary" : "text-text-secondary",
              )}
            >
              {day.hasData ? (
                <>
                  {day.onTimeRate}%
                  <span className="ml-1 text-text-tertiary">
                    ({day.onTime}/{day.present})
                  </span>
                </>
              ) : (
                <span style={{ color: CHART_MUTED }}>—</span>
              )}
            </span>
          </div>
        );
      })}
      {worstDay !== null && (
        <p className="pt-1 text-[12.5px] text-text-tertiary">
          {t("charts.weekdayHint", "Percentage of shifts started on time. Your weakest day is highlighted.")}
        </p>
      )}
    </div>
  );
}
