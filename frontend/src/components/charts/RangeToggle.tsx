"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { TREND_RANGES, type TrendRange } from "@/hooks/useDashboardTrends";

/**
 * The single filter row for everything below it. Deliberately one control
 * above all three charts rather than a per-card range picker — every chart
 * re-renders against the same slice, so cards are always comparable.
 */
export function RangeToggle({
  value,
  onChange,
}: {
  value: TrendRange;
  onChange: (value: TrendRange) => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      role="radiogroup"
      aria-label={t("charts.rangeLabel", "Chart range")}
      className="flex gap-0.5 rounded-lg bg-cream-3/40 p-0.5"
    >
      {TREND_RANGES.map((range) => {
        const isActive = value === range;
        return (
          <button
            key={range}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(range)}
            className={cn(
              "rounded-md px-2.5 py-1 text-[12.5px] font-medium tabular-nums transition-all",
              isActive
                ? "bg-glass-bg text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {t("charts.lastDays", { count: range, defaultValue: "{{count}} days" })}
          </button>
        );
      })}
    </div>
  );
}
