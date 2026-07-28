"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { GlassCard } from "@/components/shared/GlassCard";
import { Avatar } from "@/components/shared/Avatar";
import { parseDateAsUTC } from "@/lib/timezone";
import { cn } from "@/lib/utils";
import type { AttendanceDayStatus, AttendanceSummaryEmployee } from "@/types/attendance";
import {
  GanttCellGlyph,
  dayMatchesStatusFilter,
  ganttCell,
  type StatusFilter,
} from "./attendanceStatus";

interface Props {
  summary: AttendanceSummaryEmployee[];
  /** Every date in the queried range — NOT derived from the first employee's
   *  days, since each row can have a shorter window after linkedAt/leftAt
   *  filtering. Deriving it per-row makes the header narrower than the body. */
  dates: string[];
  todayStr: string;
  statusFilter: StatusFilter;
  canViewEmployee: boolean;
  onEditDay?: (employee: AttendanceSummaryEmployee, day: AttendanceDayStatus) => void;
}

export function AttendanceGantt({
  summary,
  dates,
  todayStr,
  statusFilter,
  canViewEmployee,
  onEditDay,
}: Props) {
  const { t } = useTranslation();

  return (
    <GlassCard hover={false}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[200px] border-b border-cream-3/60 bg-glass-bg px-3 py-2.5 text-left text-[13px] font-semibold text-text-primary backdrop-blur-md">
                {t("attendance.employee", "Employee")}
              </th>
              {dates.map((date) => {
                const d = parseDateAsUTC(date);
                const dow = d.getUTCDay();
                const isWeekend = dow === 0 || dow === 6;
                const isToday = date === todayStr;
                return (
                  <th
                    key={date}
                    className={cn(
                      "relative min-w-[32px] border-b border-cream-3/60 px-0.5 pb-1 pt-1.5 text-center font-medium",
                      isWeekend && !isToday && "bg-cream-3/30",
                      isToday && "bg-coffee/8",
                      // Sunday closes the week — a divider on its right groups
                      // the columns into readable weeks.
                      dow === 0 && "border-r border-cream-3/55",
                      isWeekend ? "text-text-tertiary/70" : "text-text-secondary",
                    )}
                  >
                    {isToday && (
                      <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[8.5px] font-semibold uppercase leading-none tracking-wider text-coffee">
                        ↓
                      </span>
                    )}
                    <div className="text-[10px] leading-tight">
                      {d.toLocaleDateString("en", { weekday: "narrow", timeZone: "UTC" })}
                    </div>
                    <div
                      className={cn(
                        "text-[12px] leading-tight tabular-nums",
                        isToday && "font-semibold text-coffee",
                      )}
                    >
                      {d.getUTCDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {summary.map((emp, empIdx) => {
              const hasShift = !!emp.shiftName;
              const presentCount = emp.days.filter((d) => d.status === "present").length;
              const absentCount = emp.days.filter((d) => d.status === "absent").length;
              const lateCount = emp.days.filter((d) => d.status === "present" && d.isLate).length;
              const leaveCount = emp.days.filter((d) => d.status === "leave").length;
              const scheduledDays = emp.days.filter(
                (d) => d.status !== "closure" && d.status !== "upcoming",
              ).length;
              const dayByDate = new Map(emp.days.map((d) => [d.date, d]));

              return (
                <tr
                  key={emp.employeePublicId}
                  className="transition-colors duration-[120ms] hover:bg-cream-3/25"
                >
                  <td className="sticky left-0 z-10 border-b border-cream-3/30 bg-glass-bg px-3 py-2 backdrop-blur-md">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={emp.employeeName} index={empIdx} size={26} />
                      <div className="min-w-0 flex-1">
                        {canViewEmployee ? (
                          <Link
                            href={`/console/employees/${emp.employeePublicId}`}
                            className="block truncate text-[13px] font-medium leading-tight text-text-primary no-underline transition-colors hover:text-coffee"
                          >
                            {emp.employeeName}
                          </Link>
                        ) : (
                          <div className="truncate text-[13px] font-medium leading-tight text-text-primary">
                            {emp.employeeName}
                          </div>
                        )}
                        <div className="mt-0.5 text-[10.5px] leading-tight text-text-tertiary">
                          {emp.shiftName || t("attendance.noShift", "No shift")}
                        </div>
                        {hasShift ? (
                          <div className="mt-1 flex items-center gap-2 text-[10.5px] font-medium tabular-nums">
                            <span className="text-green">
                              {presentCount}/{scheduledDays}
                            </span>
                            {absentCount > 0 && <span className="text-red">· {absentCount} abs</span>}
                            {lateCount > 0 && <span className="text-amber">· {lateCount} late</span>}
                            {leaveCount > 0 && <span className="text-blue">· {leaveCount} lv</span>}
                          </div>
                        ) : (
                          <div className="mt-1 text-[10.5px] italic text-text-tertiary/60">
                            {t("attendance.noShiftHint", "attendance not tracked")}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {dates.map((date) => {
                    const day = dayByDate.get(date);
                    const dow = parseDateAsUTC(date).getUTCDay();
                    const isWeekend = dow === 0 || dow === 6;
                    const isToday = date === todayStr;
                    const editable =
                      !!onEditDay && day?.status === "present" && !!day?.attendancePublicId;
                    const dimmed =
                      !!day && statusFilter !== "all" && !dayMatchesStatusFilter(day, statusFilter);
                    return (
                      <td
                        key={date}
                        className={cn(
                          "border-b border-cream-3/30 px-0.5 py-1.5 text-center",
                          isWeekend && !isToday && "bg-cream-3/20",
                          isToday && "bg-coffee/6",
                          dow === 0 && "border-r border-cream-3/40",
                        )}
                      >
                        {day ? (
                          <span
                            className={cn(
                              "inline-block transition-opacity duration-150",
                              dimmed && "opacity-15",
                            )}
                          >
                            <GanttCellGlyph
                              spec={ganttCell(day, hasShift)}
                              onClick={editable ? () => onEditDay!(emp, day) : undefined}
                            />
                          </span>
                        ) : (
                          <span
                            title={t("attendance.notEmployedOnDate", "Not active on this date")}
                            className="inline-block h-[6px] w-[6px] rounded-full bg-cream-3/40"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
