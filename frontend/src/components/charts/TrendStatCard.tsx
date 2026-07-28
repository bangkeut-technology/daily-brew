"use client";

import { useTranslation } from "react-i18next";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/shared/GlassCard";
import { Sparkline } from "./Sparkline";

/**
 * Stat tile with the two optional parts that make a number mean something: a
 * delta against the previous window of equal length, and the shape that got it
 * there.
 *
 * The delta is coloured by direction x whether up is good — for these metrics
 * up is always good, so a rising rate is green regardless of the metric.
 */
export function TrendStatCard({
  label,
  value,
  suffix = "%",
  hint,
  delta,
  series,
  color,
  isStale,
}: {
  label: string;
  value: number;
  suffix?: string;
  hint: string;
  /** Percentage points vs the previous window; null hides the chip. */
  delta: number | null;
  series: number[];
  color: string;
  isStale?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <GlassCard hover={false}>
      <div className={cn("p-4 transition-opacity duration-200", isStale && "opacity-50")}>
        <p className="mb-1 text-[13px] uppercase tracking-[1px] text-text-tertiary">{label}</p>
        <div className="flex items-baseline gap-2">
          {/* Proportional figures: tabular-nums makes a large standalone number
              look loose. Alignment only matters in the table view. */}
          <p className="text-[30px] font-bold leading-none text-text-primary">
            {value}
            <span className="text-[20px] font-semibold text-text-secondary">{suffix}</span>
          </p>
          {delta !== null && <DeltaChip delta={delta} />}
        </div>
        <div className="mb-1.5 mt-3">
          <Sparkline values={series} color={color} />
        </div>
        <p className="text-[13px] text-text-tertiary">{hint}</p>
        {delta !== null && (
          <p className="sr-only">
            {t("charts.vsPrevious", { delta, defaultValue: "{{delta}} points vs the previous period" })}
          </p>
        )}
      </div>
    </GlassCard>
  );
}

function DeltaChip({ delta }: { delta: number }) {
  const flat = delta === 0;
  const Icon = flat ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[12px] font-semibold tabular-nums",
        flat && "bg-cream-3/60 text-text-tertiary",
        delta > 0 && "bg-green/10 text-green",
        delta < 0 && "bg-red/10 text-red",
      )}
    >
      <Icon size={11} aria-hidden />
      {flat ? "0" : `${delta > 0 ? "+" : ""}${delta}`}
    </span>
  );
}
