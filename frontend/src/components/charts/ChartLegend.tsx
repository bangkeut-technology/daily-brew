"use client";

import { useTranslation } from "react-i18next";
import type { AttendanceSeries } from "./chartTokens";

/**
 * Always rendered for a multi-series chart: the swatch beside the name is the
 * identity channel that doesn't depend on telling two fills apart.
 */
export function ChartLegend({ series }: { series: AttendanceSeries[] }) {
  const { t } = useTranslation();

  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {series.map((item) => (
        <li key={item.key} className="flex items-center gap-1.5 text-[12.5px] text-text-secondary">
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: item.color }}
          />
          {t(item.i18nKey, item.defaultLabel)}
        </li>
      ))}
    </ul>
  );
}
