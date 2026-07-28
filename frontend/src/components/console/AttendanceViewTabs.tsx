"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GanttChart, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type AttendanceViewMode = "gantt" | "summary" | "log";

const VIEW_TABS: {
  value: AttendanceViewMode;
  icon: typeof GanttChart;
  labelKey: string;
  fallback: string;
}[] = [
  { value: "gantt", icon: GanttChart, labelKey: "attendance.gantt", fallback: "Monthly" },
  { value: "summary", icon: LayoutGrid, labelKey: "attendance.summary", fallback: "Summary" },
  { value: "log", icon: List, labelKey: "attendance.log", fallback: "Log" },
];

/** Segmented control whose active pill slides between the measured tab bounds. */
export function AttendanceViewTabs({
  view,
  onChange,
}: {
  view: AttendanceViewMode;
  onChange: (view: AttendanceViewMode) => void;
}) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    const idx = VIEW_TABS.findIndex((tab) => tab.value === view);
    const btn = btnRefs.current[idx];
    const container = containerRef.current;
    if (!btn || !container) return;
    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setPill({ left: bRect.left - cRect.left, width: bRect.width });
  }, [view]);

  useEffect(() => {
    measure();
  }, [measure]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      className="relative flex gap-1 rounded-xl border border-glass-border bg-glass-bg p-1 sm:ml-auto"
    >
      {pill && (
        <div
          aria-hidden
          className="absolute bottom-1 top-1 rounded-lg bg-coffee transition-all duration-250 ease-out"
          style={{ left: pill.left, width: pill.width }}
        />
      )}
      {VIEW_TABS.map((tab, i) => {
        const Icon = tab.icon;
        const active = view === tab.value;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative z-[1] flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-200",
              active ? "text-white" : "text-text-secondary hover:text-text-primary",
            )}
          >
            <Icon size={14} />
            {t(tab.labelKey, tab.fallback)}
          </button>
        );
      })}
    </div>
  );
}
