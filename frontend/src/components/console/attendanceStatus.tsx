"use client";

import { useTranslation } from "react-i18next";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import { parseDateAsUTC } from "@/lib/timezone";
import type { AttendanceDayStatus, AttendanceRecord } from "@/types/attendance";

/** Log-view status filter. 'late' is a sub-filter of present (status=present + isLate). */
export type StatusFilter = "all" | "present" | "late" | "absent" | "leave" | "voided";

export const STATUS_FILTERS: { value: StatusFilter; labelKey: string; fallback: string }[] = [
  { value: "all", labelKey: "attendance.filterStatusAll", fallback: "All" },
  { value: "present", labelKey: "attendance.present", fallback: "Present" },
  { value: "late", labelKey: "attendance.late", fallback: "Late" },
  { value: "absent", labelKey: "attendance.absent", fallback: "Absent" },
  { value: "leave", labelKey: "attendance.leave", fallback: "Leave" },
  { value: "voided", labelKey: "attendance.voided", fallback: "Voided" },
];

export function matchesStatusFilter(a: AttendanceRecord, f: StatusFilter): boolean {
  switch (f) {
    case "all":
      return true;
    case "present":
      return a.status === "present";
    case "late":
      return a.status === "present" && !!a.isLate;
    case "absent":
      return a.status === "absent";
    case "leave":
      return a.status === "on_leave";
    case "voided":
      return a.status === "voided";
  }
}

/** The same status filter, applied to a Monthly/gantt day-cell. */
export function dayMatchesStatusFilter(day: AttendanceDayStatus, f: StatusFilter): boolean {
  switch (f) {
    case "all":
      return true;
    case "present":
      return day.status === "present";
    case "late":
      return day.status === "present" && !!day.isLate;
    case "absent":
      return day.status === "absent";
    case "leave":
      return day.status === "leave";
    case "voided":
      return day.status === "voided";
  }
}

/**
 * A component rather than a `dayStatusBadge(day)` helper: the labels need
 * `useTranslation`, and a bare function returning JSX can't hold a hook.
 */
export function DayStatusBadge({ day }: { day: AttendanceDayStatus }) {
  const { t } = useTranslation();
  switch (day.status) {
    case "present":
      if (day.isLate) return <StatusBadge label={t("attendance.late", "Late")} variant="amber" />;
      if (day.leftEarly)
        return <StatusBadge label={t("attendance.leftEarly", "Left early")} variant="amber" />;
      return <StatusBadge label={t("attendance.present", "Present")} variant="green" />;
    case "absent":
      return <StatusBadge label={t("attendance.absent", "Absent")} variant="red" />;
    case "leave":
      return (
        <StatusBadge
          label={
            day.leaveType === "paid"
              ? t("leave.typePaid", "Paid leave")
              : t("leave.typeUnpaid", "Unpaid leave")
          }
          variant="blue"
        />
      );
    case "closure":
      return <StatusBadge label={t("attendance.closed", "Closed")} variant="gray" />;
    case "upcoming":
      return <StatusBadge label={t("attendance.upcoming", "Upcoming")} variant="gray" />;
    case "off":
      return <StatusBadge label={t("attendance.off", "Off")} variant="gray" />;
    case "voided":
      return <StatusBadge label={t("attendance.voided", "Voided")} variant="gray" />;
  }
}

export function formatDayLabel(dateStr: string): string {
  const d = parseDateAsUTC(dateStr);
  const weekday = d.toLocaleDateString("en", { weekday: "short", timeZone: "UTC" });
  return `${weekday} ${d.getUTCDate()}`;
}

/** Visual instructions for a single Monthly-grid cell. */
export type GanttCellSpec =
  | { kind: "dot-muted"; title: string }
  | { kind: "badge"; code: string; bg: string; text: string; title: string };

export function ganttCell(day: AttendanceDayStatus, hasShift: boolean): GanttCellSpec {
  switch (day.status) {
    case "present":
      if (day.isLate) {
        return {
          kind: "badge",
          code: "Lt",
          bg: "bg-amber/15",
          text: "text-amber",
          title: `Late — ${day.checkInAt || ""}`,
        };
      }
      if (day.leftEarly) {
        return {
          kind: "badge",
          code: "LfE",
          bg: "bg-amber/15",
          text: "text-amber",
          title: `Left early — ${day.checkOutAt || ""}`,
        };
      }
      return {
        kind: "badge",
        code: "Pre",
        bg: "bg-green/12",
        text: "text-green",
        title: `Present — ${day.checkInAt || ""}${day.checkOutAt ? ` → ${day.checkOutAt}` : ""}`,
      };
    case "absent":
      // Without a shift there's no expectation to miss, so an "absent" day is
      // simply untracked rather than a red flag.
      return hasShift
        ? { kind: "badge", code: "Abs", bg: "bg-red/12", text: "text-red", title: "Absent" }
        : { kind: "dot-muted", title: "Not tracked" };
    case "leave":
      return {
        kind: "badge",
        code: "Lv",
        bg: "bg-[#3B6FA0]/12",
        text: "text-blue",
        title: day.leaveType === "paid" ? "Paid leave" : "Unpaid leave",
      };
    case "closure":
      return {
        kind: "badge",
        code: "C",
        bg: "bg-[#AE9D95]/10",
        text: "text-text-tertiary",
        title: "Closed",
      };
    case "upcoming":
      return { kind: "dot-muted", title: "Upcoming" };
    case "off":
      return {
        kind: "badge",
        code: "Off",
        bg: "bg-[#AE9D95]/10",
        text: "text-text-tertiary",
        title: "Off day",
      };
    case "voided":
      return {
        kind: "badge",
        code: "Vd",
        bg: "bg-[#AE9D95]/10",
        text: "text-text-tertiary",
        title: `Voided${day.voidedByEmail ? ` — removed by ${day.voidedByEmail}` : ""}`,
      };
  }
}

export function GanttCellGlyph({ spec, onClick }: { spec: GanttCellSpec; onClick?: () => void }) {
  if (spec.kind === "dot-muted") {
    return (
      <span
        title={spec.title}
        className="inline-flex h-[22px] w-[26px] cursor-default items-center justify-center font-mono text-[12px] text-text-tertiary/35"
      >
        {"–"}
      </span>
    );
  }

  const inner = (
    <span
      title={spec.title}
      className={cn(
        "inline-flex h-[22px] w-[26px] items-center justify-center rounded font-mono text-[11px] font-semibold",
        spec.bg,
        spec.text,
      )}
    >
      {spec.code}
    </span>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      aria-label={spec.title}
      className="cursor-pointer rounded-md p-0 hover:bg-cream-3/40"
    >
      {inner}
    </button>
  ) : (
    inner
  );
}
