"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ChevronDown, Pencil } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Avatar } from "@/components/shared/Avatar";
import { cn } from "@/lib/utils";
import type { AttendanceDayStatus, AttendanceSummaryEmployee } from "@/types/attendance";
import { dayStatusBadge, formatDayLabel } from "./attendanceStatus";

/** One employee's month, collapsed to a totals row that expands into day rows. */
export function AttendanceSummaryCard({
  emp,
  empIdx,
  canViewEmployee,
  onEditDay,
}: {
  emp: AttendanceSummaryEmployee;
  empIdx: number;
  canViewEmployee: boolean;
  onEditDay?: (day: AttendanceDayStatus) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const presentDays = emp.days.filter((d) => d.status === "present").length;
  const absentDays = emp.days.filter((d) => d.status === "absent").length;
  const leaveDays = emp.days.filter((d) => d.status === "leave").length;
  const lateDays = emp.days.filter((d) => d.status === "present" && d.isLate).length;

  return (
    <GlassCard hover={false}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left"
      >
        <Avatar name={emp.employeeName} index={empIdx} size={36} />
        <div className="min-w-0 flex-1">
          <div className="text-[15.5px] font-medium text-text-primary">
            {canViewEmployee ? (
              <Link
                href={`/console/employees/${emp.employeePublicId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-text-primary no-underline transition-colors hover:text-coffee"
              >
                {emp.employeeName}
              </Link>
            ) : (
              emp.employeeName
            )}
          </div>
          <div className="text-[13px] text-text-tertiary">
            {emp.shiftName || t("attendance.noShift", "No shift")}
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <span className="rounded-full bg-green/10 px-2 py-0.5 text-[12.5px] font-medium text-green">
            {presentDays} {t("attendance.present", "present")}
          </span>
          {absentDays > 0 && (
            <span className="rounded-full bg-red/10 px-2 py-0.5 text-[12.5px] font-medium text-red">
              {absentDays} {t("attendance.absent", "absent")}
            </span>
          )}
          {lateDays > 0 && (
            <span className="rounded-full bg-amber/10 px-2 py-0.5 text-[12.5px] font-medium text-amber">
              {lateDays} {t("attendance.late", "late")}
            </span>
          )}
          {leaveDays > 0 && (
            <span className="rounded-full bg-[#3B6FA0]/10 px-2 py-0.5 text-[12.5px] font-medium text-blue">
              {leaveDays} {t("attendance.onLeave", "on leave")}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-text-tertiary transition-transform duration-250 ease-out",
            open && "rotate-180",
          )}
        />
      </div>

      {/* 0fr → 1fr animates the height without measuring the content. */}
      <div
        className="grid transition-[grid-template-rows] duration-250 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-cream-3/40 border-t border-cream-3/60">
            {emp.days.map((day) => {
              const canEdit = !!onEditDay && day.status === "present" && !!day.attendancePublicId;
              return (
                <div
                  key={day.date}
                  className="flex cursor-default items-center gap-3 px-5 py-2 transition-colors duration-[120ms] hover:bg-cream-3/35"
                >
                  <div className="w-[72px] text-[13.5px] text-text-secondary">
                    {formatDayLabel(day.date)}
                  </div>
                  <div className="flex flex-1 items-center gap-2 font-mono text-sm tabular-nums text-text-secondary">
                    {day.status === "present" && (
                      <>
                        <span>
                          {day.checkInAt}
                          {day.checkOutAt ? ` → ${day.checkOutAt}` : ""}
                        </span>
                        {day.editedAt && (
                          <span
                            title={t("attendance.editedTooltip", "Edited by a manager")}
                            className="inline-flex items-center rounded bg-coffee/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-coffee"
                          >
                            {t("attendance.editedBadge", "Edited")}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {dayStatusBadge(day)}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => onEditDay!(day)}
                      aria-label={t("attendance.editAria", "Edit attendance")}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-cream-3/40 hover:text-coffee"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
