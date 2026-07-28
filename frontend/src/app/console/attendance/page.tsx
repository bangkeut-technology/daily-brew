"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, ClipboardList } from "lucide-react";
import { getWorkspacePublicId } from "@/lib/api";
import { endOfMonthInTimezone, formatDateUTC, parseDateAsUTC } from "@/lib/timezone";
import { useWorkspaceTimezone } from "@/hooks/useWorkspaceSettings";
import { useAttendance } from "@/hooks/useAttendance";
import { useAttendanceSummary } from "@/hooks/useAttendanceSummary";
import { useEmployees } from "@/hooks/useEmployees";
import { usePlan } from "@/hooks/usePlan";
import { useRoleContext } from "@/hooks/useRoleContext";
import { useDateFormat } from "@/hooks/useDateFormat";
import type { AttendanceDayStatus, AttendanceRecord, AttendanceSummaryEmployee } from "@/types/attendance";
import { PageHeader } from "@/components/shared/PageHeader";
import { GlassCard, GlassCardHeader } from "@/components/shared/GlassCard";
import { Avatar } from "@/components/shared/Avatar";
import { CustomDatePicker } from "@/components/shared/CustomDatePicker";
import { CustomSelect } from "@/components/shared/CustomSelect";
import { AttendanceRow } from "@/components/shared/AttendanceRow";
import { AttendanceEditModal } from "@/components/console/AttendanceEditModal";
import { AttendanceCreateModal } from "@/components/console/AttendanceCreateModal";
import { AttendanceDeleteModal } from "@/components/console/AttendanceDeleteModal";
import { AttendanceExportButton } from "@/components/console/AttendanceExportButton";
import { AttendanceGantt } from "@/components/console/AttendanceGantt";
import { AttendanceSummaryCard } from "@/components/console/AttendanceSummaryCard";
import { AttendanceViewTabs, type AttendanceViewMode } from "@/components/console/AttendanceViewTabs";
import { STATUS_FILTERS, matchesStatusFilter, type StatusFilter } from "@/components/console/attendanceStatus";
import { Skeleton } from "@/components/admin/AdminDataStates";
import { cn } from "@/lib/utils";

/** Reads a query param during render. Guarded because this route is prerendered. */
function readParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Mirrors the filter state into the URL without a router navigation — the
 * range/employee/view combination is worth sharing and reloading into, but it
 * shouldn't push history entries as the user drags a date picker.
 */
function syncSearchParams(from: string, to: string, employee: string, view: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);
  if (employee) url.searchParams.set("employee", employee);
  else url.searchParams.delete("employee");
  url.searchParams.set("view", view);
  window.history.replaceState({}, "", url.toString());
}

export default function AttendancePage() {
  const { t } = useTranslation();
  const wsTz = useWorkspaceTimezone();
  const workspaceId = getWorkspacePublicId() || "";
  const fmtDate = useDateFormat();

  const [from, setFromState] = useState(() => readParam("from") || wsTz.startOfMonth());
  const [to, setToState] = useState(() => readParam("to") || wsTz.today());
  const [employeeFilter, setEmployeeFilterState] = useState(() => readParam("employee") || "");
  const [view, setViewState] = useState<AttendanceViewMode>(
    () => (readParam("view") || "gantt") as AttendanceViewMode,
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: attendance, isLoading } = useAttendance(workspaceId, from, to);
  const { data: summary, isLoading: summaryLoading } = useAttendanceSummary(workspaceId, from, to);
  const { data: employees } = useEmployees(workspaceId);
  const { data: roleContext, isLoading: roleLoading } = useRoleContext();
  const { data: plan } = usePlan(workspaceId);

  const [editTarget, setEditTarget] = useState<AttendanceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AttendanceRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const isManager = roleContext?.isManager ?? false;
  const isEmployee = !!roleContext && roleContext.isEmployee && !roleContext.isOwner && !isManager;
  const permissions = roleContext?.managerPermissions ?? [];
  const canEditAttendance =
    !!roleContext && (roleContext.isOwner || permissions.includes("manage_attendance"));
  const canViewEmployee =
    !!roleContext && (roleContext.isOwner || permissions.includes("manage_employees"));

  const setFrom = (value: string) => {
    setFromState(value);
    syncSearchParams(value, to, employeeFilter, view);
  };
  const setTo = (value: string) => {
    setToState(value);
    syncSearchParams(from, value, employeeFilter, view);
  };
  const setEmployeeFilter = (value: string) => {
    setEmployeeFilterState(value);
    syncSearchParams(from, to, value, view);
  };
  const setView = (v: AttendanceViewMode) => {
    setViewState(v);
    // The Monthly grid is a calendar month by definition, so switching to it
    // widens a partial range out to the end of the month.
    if (v === "gantt") {
      const newTo = endOfMonthInTimezone(wsTz.timezone);
      setToState(newTo);
      syncSearchParams(from, newTo, employeeFilter, v);
    } else {
      syncSearchParams(from, to, employeeFilter, v);
    }
  };

  // Employees only ever see their own rows; the dropdown is for everyone else.
  const activeFilter = isEmployee && roleContext?.employee ? roleContext.employee.publicId : employeeFilter;
  const filtered = activeFilter
    ? attendance?.filter((a) => a.employeePublicId === activeFilter)
    : attendance;
  const logRows =
    statusFilter === "all" ? filtered : filtered?.filter((a) => matchesStatusFilter(a, statusFilter));
  const filteredSummary = activeFilter
    ? summary?.filter((s) => s.employeePublicId === activeFilter)
    : summary;

  const employeeOptions = [
    { value: "", label: t("attendance.allEmployees", "All employees") },
    ...(employees?.map((e) => ({ value: e.publicId, label: e.name })) ?? []),
  ];

  // Built from the query range rather than the first employee's days: each row
  // may cover a shorter window after linkedAt/leftAt filtering, which would
  // otherwise make the header narrower than the widest body row.
  const ganttDates = useMemo(() => {
    const dates: string[] = [];
    const start = parseDateAsUTC(from);
    const end = parseDateAsUTC(to);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return dates;
    for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      dates.push(formatDateUTC(d));
    }
    return dates;
  }, [from, to]);
  const todayStr = wsTz.today();

  const editFromDay = (emp: AttendanceSummaryEmployee, day: AttendanceDayStatus) =>
    setEditTarget({
      publicId: day.attendancePublicId!,
      employeeName: emp.employeeName,
      employeePublicId: emp.employeePublicId,
      shiftName: emp.shiftName,
      date: day.date,
      checkInAt: day.checkInAt ?? null,
      checkOutAt: day.checkOutAt ?? null,
      isLate: !!day.isLate,
      leftEarly: !!day.leftEarly,
      status: "present",
      originalCheckInAt: day.originalCheckInAt ?? null,
      originalCheckOutAt: day.originalCheckOutAt ?? null,
    });

  if (roleLoading) {
    return (
      <div className="page-enter" aria-busy="true">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const loading = view === "log" ? isLoading : summaryLoading;

  return (
    <div className="page-enter">
      <PageHeader
        title={isEmployee ? t("nav.myAttendance", "My Attendance") : t("nav.attendance", "Attendance")}
        help={
          isEmployee
            ? { href: "/guides/employee#step-employee-5", label: "How check-in works" }
            : { href: "/guides/owner#step-owner-7", label: "How attendance tracking works" }
        }
        action={
          <div className="flex items-center gap-2">
            <AttendanceExportButton
              workspacePublicId={workspaceId}
              from={from}
              to={to}
              employeePublicId={activeFilter || undefined}
              canExport={plan?.canExportAttendance ?? false}
            />
            {canEditAttendance && (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-coffee px-4 py-2 text-[15px] font-medium text-white transition-all duration-150 hover:bg-coffee-light"
              >
                + {t("attendance.addAttendance", "Add attendance")}
              </button>
            )}
          </div>
        }
      />

      <p className="-mt-2 mb-5 text-[15px] leading-relaxed text-text-secondary">
        {isEmployee
          ? t(
              "attendance.employeeDescription",
              "Your check-in and check-out history. Filter by date range.",
            )
          : t(
              "attendance.ownerDescription",
              "View check-in and check-out records for all employees. Filter by date range or employee.",
            )}
      </p>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-auto">
          <label htmlFor="attendance-from" className="mb-1 block text-[13px] font-medium text-text-secondary">
            {t("attendance.from", "From")}
          </label>
          <CustomDatePicker id="attendance-from" value={from} onChange={setFrom} />
        </div>
        <div className="w-full sm:w-auto">
          <label htmlFor="attendance-to" className="mb-1 block text-[13px] font-medium text-text-secondary">
            {t("attendance.to", "To")}
          </label>
          <CustomDatePicker id="attendance-to" value={to} onChange={setTo} />
        </div>
        {!isEmployee && (
          <div className="w-full sm:w-48">
            <label htmlFor="attendance-employee" className="mb-1 block text-[13px] font-medium text-text-secondary">
              {t("attendance.employee", "Employee")}
            </label>
            <CustomSelect
              id="attendance-employee"
              value={employeeFilter}
              onChange={setEmployeeFilter}
              options={employeeOptions}
              placeholder={t("attendance.allEmployees", "All employees")}
              renderOption={(opt, idx) =>
                opt.value ? (
                  <>
                    <Avatar name={opt.label} index={idx - 1} size={22} />
                    <span className="truncate">{opt.label}</span>
                  </>
                ) : (
                  opt.label
                )
              }
              renderSelected={(opt) =>
                opt.value ? (
                  <>
                    <Avatar
                      name={opt.label}
                      index={employees?.findIndex((e) => e.publicId === opt.value) ?? 0}
                      size={20}
                    />
                    <span className="truncate">{opt.label}</span>
                  </>
                ) : (
                  <>{opt.label}</>
                )
              }
            />
          </div>
        )}
        <AttendanceViewTabs view={view} onChange={setView} />
      </div>

      {(view === "log" || view === "gantt") && (
        <div className="-mt-1 mb-5 flex flex-wrap gap-1">
          {STATUS_FILTERS.map((s) => {
            const isActive = statusFilter === s.value;
            // Counts reflect the flat log list; in the Monthly grid the same
            // status spans many cells, so labels go without a count there.
            const count =
              view === "log"
                ? s.value === "all"
                  ? (filtered?.length ?? 0)
                  : (filtered?.filter((a) => matchesStatusFilter(a, s.value)).length ?? 0)
                : null;
            return (
              <button
                key={s.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setStatusFilter(s.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-coffee/12 text-coffee"
                    : "bg-glass-bg text-text-secondary hover:bg-cream-3",
                )}
              >
                {t(s.labelKey, s.fallback)}
                {count !== null ? ` (${count})` : ""}
              </button>
            );
          })}
        </div>
      )}

      {view !== "log" && <GanttLegend />}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      ) : view === "gantt" ? (
        !filteredSummary?.length ? (
          <AttendanceEmptyState />
        ) : (
          <AttendanceGantt
            summary={filteredSummary}
            dates={ganttDates}
            todayStr={todayStr}
            statusFilter={statusFilter}
            canViewEmployee={canViewEmployee}
            onEditDay={canEditAttendance ? editFromDay : undefined}
          />
        )
      ) : view === "summary" ? (
        !filteredSummary?.length ? (
          <AttendanceEmptyState />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredSummary.map((emp, empIdx) => (
              <AttendanceSummaryCard
                key={emp.employeePublicId}
                emp={emp}
                empIdx={empIdx}
                canViewEmployee={canViewEmployee}
                onEditDay={canEditAttendance ? (day) => editFromDay(emp, day) : undefined}
              />
            ))}
          </div>
        )
      ) : !logRows?.length ? (
        <AttendanceEmptyState />
      ) : (
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t("attendance.log", "Attendance log")}
            action={
              <span className="flex items-center gap-1.5 text-sm text-text-tertiary">
                <CalendarDays size={13} />
                {from === to ? fmtDate(from) : `${fmtDate(from)} – ${fmtDate(to)}`}
                <span className="ml-1">
                  ({t("attendance.recordCount", { count: logRows.length, defaultValue: "{{count}} records" })})
                </span>
              </span>
            }
          />
          <div>
            {logRows.map((a, i) => (
              <AttendanceRow
                key={a.publicId}
                employee={a.employeeName || ""}
                employeePublicId={a.employeePublicId}
                canViewEmployee={canViewEmployee}
                shift={a.shiftName || null}
                date={fmtDate(a.date)}
                time={a.checkInAt}
                checkOut={a.checkOutAt}
                isLate={a.isLate}
                leftEarly={a.leftEarly}
                status={a.status}
                index={i}
                edited={!!a.editedAt}
                voided={a.status === "voided"}
                voidedByEmail={a.voidedByEmail ?? null}
                voidReason={a.voidReason ?? null}
                onEdit={
                  canEditAttendance && a.status === "present" ? () => setEditTarget(a) : undefined
                }
                onDelete={
                  canEditAttendance && a.status === "present" ? () => setDeleteTarget(a) : undefined
                }
              />
            ))}
          </div>
        </GlassCard>
      )}

      <AttendanceEditModal
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        workspaceId={workspaceId}
        tz={wsTz.timezone}
        record={editTarget}
        onRequestDelete={
          canEditAttendance && editTarget
            ? () => {
                // Same record, handed to the delete modal — so voiding is
                // reachable from a Monthly cell, not just the Log view's
                // inline trash button.
                const target = editTarget;
                setEditTarget(null);
                setDeleteTarget(target);
              }
            : undefined
        }
      />

      <AttendanceDeleteModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        workspaceId={workspaceId}
        tz={wsTz.timezone}
        record={deleteTarget}
      />

      {canEditAttendance && (
        <AttendanceCreateModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          workspaceId={workspaceId}
          today={todayStr}
          defaultDate={to <= todayStr ? to : todayStr}
          onCollision={(existing) => {
            // The day already has a record — switch straight to editing it.
            setCreateOpen(false);
            setEditTarget(existing);
          }}
        />
      )}
    </div>
  );
}

function GanttLegend() {
  const { t } = useTranslation();
  const items: { code: string; className: string; label: string }[] = [
    { code: "Pre", className: "bg-green/12 text-green", label: t("attendance.present", "Present") },
    { code: "Abs", className: "bg-red/12 text-red", label: t("attendance.absent", "Absent") },
    { code: "Lt", className: "bg-amber/15 text-amber", label: t("attendance.late", "Late") },
    { code: "LfE", className: "bg-amber/15 text-amber", label: t("attendance.leftEarly", "Left early") },
    { code: "Lv", className: "bg-[#3B6FA0]/12 text-blue", label: t("attendance.leave", "Leave") },
    { code: "Off", className: "bg-[#AE9D95]/10 text-text-tertiary", label: t("attendance.off", "Off day") },
    { code: "C", className: "bg-[#AE9D95]/10 text-text-tertiary", label: t("attendance.closed", "Closed") },
    { code: "Vd", className: "bg-[#AE9D95]/10 text-text-tertiary", label: t("attendance.voided", "Voided") },
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-medium text-text-secondary">
      {items.map((item) => (
        <span key={item.code} className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block h-5 w-5 rounded text-center font-mono text-[11px] leading-5",
              item.className,
            )}
          >
            {item.code}
          </span>
          {item.label}
        </span>
      ))}
      <span className="flex items-center gap-1.5 text-text-tertiary/70">
        <span className="inline-flex h-5 w-5 items-center justify-center font-mono text-text-tertiary/45">
          –
        </span>
        {t("attendance.notTracked", "Not tracked")}
      </span>
    </div>
  );
}

function AttendanceEmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-[1.5px] border-dashed border-cream-3 bg-glass-bg backdrop-blur-md">
      <ClipboardList size={28} className="mb-2 text-text-tertiary" />
      <span className="text-[15px] text-text-tertiary">
        {t("attendance.noRecords", "No attendance records for this period")}
      </span>
    </div>
  );
}
