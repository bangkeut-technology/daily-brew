"use client";

import { useTranslation } from "react-i18next";
import { BarChart3, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Chart ⇄ table switch. The table is the accessible twin, not a nice-to-have:
 * it's how the exact numbers stay reachable without hovering a 6px column.
 */
export function ChartViewToggle({
  view,
  onChange,
}: {
  view: "chart" | "table";
  onChange: (view: "chart" | "table") => void;
}) {
  const { t } = useTranslation();

  const options = [
    { value: "chart" as const, icon: BarChart3, label: t("charts.viewChart", "Chart") },
    { value: "table" as const, icon: Table2, label: t("charts.viewTable", "Table") },
  ];

  return (
    <div role="tablist" className="flex gap-0.5 rounded-lg bg-cream-3/40 p-0.5">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = view === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-[12.5px] font-medium transition-all",
              isActive
                ? "bg-glass-bg text-text-primary shadow-sm"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            <Icon size={12} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
