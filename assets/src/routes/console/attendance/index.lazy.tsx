import { createLazyFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ChevronDown, ClipboardList, GanttChart, LayoutGrid, List, Pencil } from 'lucide-react';
import { useAttendance } from '@/hooks/queries/useAttendance';
import { useAttendanceSummary } from '@/hooks/queries/useAttendanceSummary';
import { useEmployees } from '@/hooks/queries/useEmployees';
import { usePlan } from '@/hooks/queries/usePlan';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { useWorkspaceTimezone } from '@/hooks/useWorkspaceTimezone';
import { getWorkspacePublicId } from '@/lib/auth';
import { endOfMonthInTimezone, parseDateAsUTC } from '@/lib/timezone';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { AttendanceRow } from '@/components/shared/AttendanceRow';
import { AttendanceEditModal } from '@/components/shared/AttendanceEditModal';
import { AttendanceCreateModal } from '@/components/shared/AttendanceCreateModal';
import { AttendanceExportButton } from '@/components/shared/AttendanceExportButton';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Avatar } from '@/components/shared/Avatar';
import { useDateFormat } from '@/hooks/useDateFormat';
import { cn } from '@/lib/utils';
import type { AttendanceDayStatus } from '@/types';

type ViewMode = 'gantt' | 'summary' | 'log';

function updateSearchParams(from: string, to: string, employee: string, view: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('from', from);
  url.searchParams.set('to', to);
  if (employee) url.searchParams.set('employee', employee);
  else url.searchParams.delete('employee');
  url.searchParams.set('view', view);
  window.history.replaceState({}, '', url.toString());
}

/* ── Status helpers ── */

function dayStatusBadge(day: AttendanceDayStatus) {
  switch (day.status) {
    case 'present':
      if (day.isLate) return <StatusBadge label="Late" variant="amber" />;
      if (day.leftEarly) return <StatusBadge label="Left early" variant="amber" />;
      return <StatusBadge label="Present" variant="green" />;
    case 'absent':
      return <StatusBadge label="Absent" variant="red" />;
    case 'leave':
      return <StatusBadge label={day.leaveType === 'paid' ? 'Paid leave' : 'Unpaid leave'} variant="blue" />;
    case 'closure':
      return <StatusBadge label="Closed" variant="gray" />;
    case 'upcoming':
      return <StatusBadge label="Upcoming" variant="gray" />;
  }
}

function formatDayLabel(dateStr: string): string {
  const d = parseDateAsUTC(dateStr);
  const weekday = d.toLocaleDateString('en', { weekday: 'short', timeZone: 'UTC' });
  const day = d.getUTCDate();
  return `${weekday} ${day}`;
}

/** Visual instructions for a single Gantt cell. */
type GanttCellSpec =
  | { kind: 'dot-filled'; title: string }
  | { kind: 'dot-open'; title: string }
  | { kind: 'dot-muted'; title: string }
  | { kind: 'badge'; code: string; bg: string; text: string; title: string };

function ganttCell(day: AttendanceDayStatus, hasShift: boolean): GanttCellSpec {
  switch (day.status) {
    case 'present':
      if (day.isLate)
        return { kind: 'badge', code: 'Lt', bg: 'bg-amber/15', text: 'text-amber', title: `Late \u2014 ${day.checkInAt || ''}` };
      if (day.leftEarly)
        return { kind: 'badge', code: 'E', bg: 'bg-amber/15', text: 'text-amber', title: `Left early \u2014 ${day.checkOutAt || ''}` };
      return { kind: 'dot-filled', title: `Present \u2014 ${day.checkInAt || ''}${day.checkOutAt ? ` \u2192 ${day.checkOutAt}` : ''}` };
    case 'absent':
      return hasShift
        ? { kind: 'dot-open', title: 'Absent' }
        : { kind: 'dot-muted', title: 'Not tracked' };
    case 'leave':
      return { kind: 'badge', code: 'Lv', bg: 'bg-[#3B6FA0]/12', text: 'text-blue', title: day.leaveType === 'paid' ? 'Paid leave' : 'Unpaid leave' };
    case 'closure':
      return { kind: 'badge', code: 'C', bg: 'bg-[#AE9D95]/10', text: 'text-text-tertiary', title: 'Closed' };
    case 'upcoming':
      return { kind: 'dot-muted', title: 'Upcoming' };
  }
}

function GanttCellGlyph({ spec, onClick }: { spec: GanttCellSpec; onClick?: () => void }) {
  const clickable = !!onClick;
  const interactiveClass = clickable ? 'cursor-pointer hover:bg-cream-3/40 rounded-md' : 'cursor-default';

  if (spec.kind === 'badge') {
    const inner = (
      <span
        title={spec.title}
        className={cn(
          'inline-flex items-center justify-center w-[26px] h-[22px] rounded text-[11px] font-semibold font-mono',
          spec.bg,
          spec.text,
        )}
      >
        {spec.code}
      </span>
    );
    return clickable ? (
      <button type="button" onClick={onClick} className={cn('p-0 border-none bg-transparent', interactiveClass)} aria-label={spec.title}>
        {inner}
      </button>
    ) : inner;
  }
  if (spec.kind === 'dot-filled') {
    const inner = (
      <span className="block w-[10px] h-[10px] rounded-full bg-green" />
    );
    return clickable ? (
      <button
        type="button"
        onClick={onClick}
        title={spec.title}
        aria-label={spec.title}
        className={cn('inline-flex items-center justify-center w-[26px] h-[22px] p-0 border-none bg-transparent', interactiveClass)}
      >
        {inner}
      </button>
    ) : (
      <span title={spec.title} className="inline-flex items-center justify-center w-[26px] h-[22px] cursor-default">
        {inner}
      </span>
    );
  }
  if (spec.kind === 'dot-open') {
    return (
      <span title={spec.title} className="inline-flex items-center justify-center w-[26px] h-[22px] cursor-default">
        <span className="block w-[10px] h-[10px] rounded-full border-[1.5px] border-red/55" />
      </span>
    );
  }
  return (
    <span
      title={spec.title}
      className="inline-flex items-center justify-center w-[26px] h-[22px] text-text-tertiary/35 text-[12px] font-mono cursor-default"
    >
      {'\u2013'}
    </span>
  );
}

export const Route = createLazyFileRoute('/console/attendance/')({
  component: AttendancePage,
});

function AttendancePage() {
  const { t } = useTranslation();
  const wsTz = useWorkspaceTimezone();

  // Read URL params; fall back to workspace-TZ-aware defaults
  const [from, setFromState] = useState(() => {
    return new URLSearchParams(window.location.search).get('from') || wsTz.startOfMonth();
  });
  const [to, setToState] = useState(() => {
    return new URLSearchParams(window.location.search).get('to') || wsTz.today();
  });
  const [employeeFilter, setEmployeeFilterState] = useState(
    () => new URLSearchParams(window.location.search).get('employee') || '',
  );
  const [view, setViewState] = useState<ViewMode>(
    () => (new URLSearchParams(window.location.search).get('view') || 'gantt') as ViewMode,
  );
  const workspaceId = getWorkspacePublicId() || '';
  const { data: attendance, isLoading } = useAttendance(workspaceId, from, to);
  const { data: summary, isLoading: summaryLoading } = useAttendanceSummary(workspaceId, from, to);
  const { data: employees } = useEmployees(workspaceId);
  const { data: roleContext, isLoading: roleLoading } = useRoleContext();
  const { data: plan } = usePlan(workspaceId);
  const fmtDate = useDateFormat();

  const isManager = roleContext?.isManager ?? false;
  const isEmployee = !!roleContext && roleContext.isEmployee && !roleContext.isOwner && !isManager;
  const employeePublicId = roleContext?.employee?.publicId;
  const canEditAttendance = !!roleContext
    && (roleContext.isOwner || (roleContext.managerPermissions ?? []).includes('manage_attendance'));

  const [editTarget, setEditTarget] = useState<{
    publicId: string;
    employeeName?: string | null;
    date: string;
    checkInAt: string | null;
    checkOutAt: string | null;
    originalCheckInAt?: string | null;
    originalCheckOutAt?: string | null;
  } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const setFrom = (value: string) => {
    setFromState(value);
    updateSearchParams(value, to, employeeFilter, view);
  };

  const setTo = (value: string) => {
    setToState(value);
    updateSearchParams(from, value, employeeFilter, view);
  };

  const setEmployeeFilter = (value: string) => {
    setEmployeeFilterState(value);
    updateSearchParams(from, to, value, view);
  };

  const setView = (v: ViewMode) => {
    setViewState(v);
    // When switching to gantt, auto-expand to full month
    if (v === 'gantt') {
      const newTo = endOfMonthInTimezone(wsTz.timezone);
      setToState(newTo);
      updateSearchParams(from, newTo, employeeFilter, v);
    } else {
      updateSearchParams(from, to, employeeFilter, v);
    }
  };

  // For employees, always filter to their own records; for owners, use the dropdown filter
  const activeFilter = isEmployee && employeePublicId ? employeePublicId : employeeFilter;
  const filtered = activeFilter
    ? attendance?.filter((a) => a.employeePublicId === activeFilter)
    : attendance;

  const filteredSummary = activeFilter
    ? summary?.filter((s) => s.employeePublicId === activeFilter)
    : summary;

  const employeeOptions = [
    { value: '', label: t('attendance.allEmployees', 'All employees') },
    ...(employees?.map((e) => ({ value: e.publicId, label: e.name })) ?? []),
  ];

  // Extract day numbers from the first employee's days for the Gantt header
  const ganttDays = filteredSummary?.[0]?.days ?? [];
  const todayStr = wsTz.today();

  if (roleLoading) {
    return (
      <div className="page-enter">
        <PageHeader title={t('nav.attendance')} />
        <p className="text-text-tertiary">{t('common.loading')}</p>
      </div>
    );
  }

  const loading = view === 'log' ? isLoading : summaryLoading;

  return (
    <div className="page-enter">
      <PageHeader
        title={isEmployee ? t('nav.myAttendance', 'My Attendance') : t('nav.attendance')}
        help={isEmployee
          ? { href: '/guides/employee#step-employee-5', label: 'How check-in works' }
          : { href: '/guides/owner#step-owner-7', label: 'How attendance tracking works' }}
        action={(
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
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light"
              >
                + {t('attendance.addAttendance', 'Add attendance')}
              </button>
            )}
          </div>
        )}
      />

      <p className="text-[15px] text-text-secondary mb-5 -mt-2 leading-relaxed">
        {isEmployee
          ? t('attendance.employeeDescription', 'Your check-in and check-out history. Filter by date range.')
          : t('attendance.ownerDescription', 'View check-in and check-out records for all employees. Filter by date range or employee.')}
      </p>

      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="w-full sm:w-auto">
          <label id="attendance-from-label" className="block text-[13px] font-medium text-text-secondary mb-1">
            {t('attendance.from', 'From')}
          </label>
          <CustomDatePicker value={from} onChange={setFrom} />
        </div>
        <div className="w-full sm:w-auto">
          <label id="attendance-to-label" className="block text-[13px] font-medium text-text-secondary mb-1">
            {t('attendance.to', 'To')}
          </label>
          <CustomDatePicker value={to} onChange={setTo} />
        </div>
        {!isEmployee && (
          <div className="w-full sm:w-48">
            <label id="attendance-employee-label" className="block text-[13px] font-medium text-text-secondary mb-1">
              {t('attendance.employee', 'Employee')}
            </label>
            <CustomSelect
              value={employeeFilter}
              onChange={setEmployeeFilter}
              options={employeeOptions}
              placeholder={t('attendance.allEmployees', 'All employees')}
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
                    <Avatar name={opt.label} index={employees?.findIndex((e) => e.publicId === opt.value) ?? 0} size={20} />
                    <span className="truncate">{opt.label}</span>
                  </>
                ) : (
                  <>{opt.label}</>
                )
              }
            />
          </div>
        )}
        <SegmentedControl view={view} setView={setView} t={t} />
      </div>

      {/* ── Legend (shown for gantt and summary) ── */}
      {view !== 'log' && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-[12px] font-medium text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-[10px] h-[10px] rounded-full bg-green" />
            {t('attendance.present', 'Present')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-[10px] h-[10px] rounded-full border-[1.5px] border-red/55" />
            {t('attendance.absent', 'Absent')}
          </span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-5 rounded bg-amber/15 text-amber text-center leading-5 font-mono text-[11px]">Lt</span> {t('attendance.late', 'Late')}</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-5 rounded bg-amber/15 text-amber text-center leading-5 font-mono text-[11px]">E</span> {t('attendance.earlyLeave', 'Early leave')}</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-5 rounded bg-[#3B6FA0]/12 text-blue text-center leading-5 font-mono text-[11px]">Lv</span> {t('attendance.leave', 'Leave')}</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-5 rounded bg-[#AE9D95]/10 text-text-tertiary text-center leading-5 font-mono text-[11px]">C</span> {t('attendance.closed', 'Closed')}</span>
          <span className="flex items-center gap-1.5 text-text-tertiary/70">
            <span className="inline-flex items-center justify-center w-5 h-5 text-text-tertiary/45 font-mono">–</span>
            {t('attendance.notTracked', 'Not tracked')}
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[15px] text-text-tertiary">{t('common.loading')}</p>
        </div>
      ) : view === 'gantt' ? (
        /* ── Gantt (monthly grid) view ── */
        !filteredSummary?.length ? (
          <EmptyState t={t} />
        ) : (
          <GlassCard hover={false}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-glass-bg backdrop-blur-md text-left px-3 py-2.5 text-[13px] font-semibold text-text-primary border-b border-cream-3/60 min-w-[200px]">
                      {t('attendance.employee', 'Employee')}
                    </th>
                    {ganttDays.map((day) => {
                      const d = parseDateAsUTC(day.date);
                      const dayNum = d.getUTCDate();
                      const weekday = d.toLocaleDateString('en', { weekday: 'narrow', timeZone: 'UTC' });
                      const dow = d.getUTCDay();
                      const isWeekend = dow === 0 || dow === 6;
                      const isWeekEnd = dow === 0; // Sunday → draw divider on the right
                      const isToday = day.date === todayStr;
                      return (
                        <th
                          key={day.date}
                          className={cn(
                            'px-0.5 pt-1.5 pb-1 text-center font-medium border-b border-cream-3/60 min-w-[32px] relative',
                            isWeekend && !isToday && 'bg-cream-3/30',
                            isToday && 'bg-coffee/8',
                            isWeekEnd && 'border-r border-cream-3/55',
                            isWeekend ? 'text-text-tertiary/70' : 'text-text-secondary',
                          )}
                        >
                          {isToday && (
                            <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[8.5px] font-semibold uppercase tracking-wider text-coffee leading-none">
                              ↓
                            </span>
                          )}
                          <div className="text-[10px] leading-tight">{weekday}</div>
                          <div
                            className={cn(
                              'text-[12px] tabular-nums leading-tight',
                              isToday && 'text-coffee font-semibold',
                            )}
                          >
                            {dayNum}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {filteredSummary.map((emp, empIdx) => {
                    const hasShift = !!emp.shiftName;
                    const presentCount = emp.days.filter((d) => d.status === 'present').length;
                    const absentCount = emp.days.filter((d) => d.status === 'absent').length;
                    const lateCount = emp.days.filter((d) => d.status === 'present' && d.isLate).length;
                    const leaveCount = emp.days.filter((d) => d.status === 'leave').length;
                    const scheduledDays = emp.days.filter((d) => d.status !== 'closure' && d.status !== 'upcoming').length;

                    return (
                      <tr key={emp.employeePublicId} className="hover:bg-cream-3/25 transition-colors duration-[120ms]">
                        <td className="sticky left-0 z-10 bg-glass-bg backdrop-blur-md px-3 py-2 border-b border-cream-3/30">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={emp.employeeName} index={empIdx} size={26} />
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-medium text-text-primary leading-tight truncate">
                                {emp.employeeName}
                              </div>
                              <div className="text-[10.5px] text-text-tertiary leading-tight mt-0.5">
                                {emp.shiftName || t('attendance.noShift', 'No shift')}
                              </div>
                              {hasShift ? (
                                <div className="flex items-center gap-2 mt-1 text-[10.5px] font-medium tabular-nums">
                                  <span className="text-green">{presentCount}/{scheduledDays}</span>
                                  {absentCount > 0 && <span className="text-red">· {absentCount} abs</span>}
                                  {lateCount > 0 && <span className="text-amber">· {lateCount} late</span>}
                                  {leaveCount > 0 && <span className="text-blue">· {leaveCount} lv</span>}
                                </div>
                              ) : (
                                <div className="text-[10.5px] text-text-tertiary/60 italic mt-1">
                                  {t('attendance.noShiftHint', 'attendance not tracked')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {emp.days.map((day) => {
                          const cell = ganttCell(day, hasShift);
                          const d = parseDateAsUTC(day.date);
                          const dow = d.getUTCDay();
                          const isWeekend = dow === 0 || dow === 6;
                          const isWeekEnd = dow === 0;
                          const isToday = day.date === todayStr;
                          const editable = canEditAttendance
                            && day.status === 'present'
                            && !!day.attendancePublicId;
                          return (
                            <td
                              key={day.date}
                              className={cn(
                                'px-0.5 py-1.5 text-center border-b border-cream-3/30',
                                isWeekend && !isToday && 'bg-cream-3/20',
                                isToday && 'bg-coffee/6',
                                isWeekEnd && 'border-r border-cream-3/40',
                              )}
                            >
                              <GanttCellGlyph
                                spec={cell}
                                onClick={editable
                                  ? () => setEditTarget({
                                      publicId: day.attendancePublicId!,
                                      employeeName: emp.employeeName,
                                      date: day.date,
                                      checkInAt: day.checkInAt ?? null,
                                      checkOutAt: day.checkOutAt ?? null,
                                      originalCheckInAt: day.originalCheckInAt ?? null,
                                      originalCheckOutAt: day.originalCheckOutAt ?? null,
                                    })
                                  : undefined}
                              />
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
        )
      ) : view === 'summary' ? (
        /* ── Summary view (collapsible) ── */
        !filteredSummary?.length ? (
          <EmptyState t={t} />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredSummary.map((emp, empIdx) => (
              <SummaryCard
                key={emp.employeePublicId}
                emp={emp}
                empIdx={empIdx}
                t={t}
                onEditDay={canEditAttendance
                  ? (day) => setEditTarget({
                      publicId: day.attendancePublicId!,
                      employeeName: emp.employeeName,
                      date: day.date,
                      checkInAt: day.checkInAt ?? null,
                      checkOutAt: day.checkOutAt ?? null,
                      originalCheckInAt: day.originalCheckInAt ?? null,
                      originalCheckOutAt: day.originalCheckOutAt ?? null,
                    })
                  : undefined}
              />
            ))}
          </div>
        )
      ) : (
        /* ── Log view (original) ── */
        filtered?.length === 0 ? (
          <EmptyState t={t} />
        ) : (
          <GlassCard hover={false}>
            <GlassCardHeader
              title={t('attendance.log', 'Attendance log')}
              action={
                <span className="flex items-center gap-1.5 text-[14px] text-text-tertiary">
                  <CalendarDays size={13} />
                  {from === to ? fmtDate(from) : `${fmtDate(from)} \u2013 ${fmtDate(to)}`}
                  <span className="ml-1">({filtered?.length} records)</span>
                </span>
              }
            />
            <div>
              {filtered?.map((a, i) => (
                <AttendanceRow
                  key={a.publicId}
                  employee={a.employeeName || ''}
                  shift={a.shiftName || null}
                  date={fmtDate(a.date)}
                  time={a.checkInAt}
                  checkOut={a.checkOutAt}
                  isLate={a.isLate}
                  leftEarly={a.leftEarly}
                  status={a.status}
                  index={i}
                  edited={!!a.editedAt}
                  onEdit={canEditAttendance && a.status === 'present'
                    ? () => setEditTarget({
                        publicId: a.publicId,
                        employeeName: a.employeeName,
                        date: a.date,
                        checkInAt: a.checkInAt,
                        checkOutAt: a.checkOutAt,
                        originalCheckInAt: a.originalCheckInAt ?? null,
                        originalCheckOutAt: a.originalCheckOutAt ?? null,
                      })
                    : undefined}
                />
              ))}
            </div>
          </GlassCard>
        )
      )}

      <AttendanceEditModal
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
        workspacePublicId={workspaceId}
        attendance={editTarget}
      />

      {canEditAttendance && (
        <AttendanceCreateModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          workspacePublicId={workspaceId}
          employees={employees?.map((e) => ({ publicId: e.publicId, name: e.name })) ?? []}
          todayStr={todayStr}
          onConflict={(existing) => {
            // Day already has a record — switch straight to editing it.
            setCreateOpen(false);
            setEditTarget({
              publicId: existing.publicId,
              employeeName: existing.employeeName ?? null,
              date: existing.date,
              checkInAt: existing.checkInAt,
              checkOutAt: existing.checkOutAt,
              originalCheckInAt: existing.originalCheckInAt ?? null,
              originalCheckOutAt: existing.originalCheckOutAt ?? null,
            });
          }}
        />
      )}
    </div>
  );
}

/* ── Segmented control with sliding pill ── */

const VIEW_TABS: { value: ViewMode; icon: typeof GanttChart; labelKey: string; fallback: string }[] = [
  { value: 'gantt', icon: GanttChart, labelKey: 'attendance.gantt', fallback: 'Monthly' },
  { value: 'summary', icon: LayoutGrid, labelKey: 'attendance.summary', fallback: 'Summary' },
  { value: 'log', icon: List, labelKey: 'attendance.log', fallback: 'Log' },
];

function SegmentedControl({
  view,
  setView,
  t,
}: {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  t: (key: string, fallback: string) => string;
}) {
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

  useEffect(() => { measure(); }, [measure]);

  return (
    <div
      ref={containerRef}
      className="relative flex gap-1 sm:ml-auto bg-glass-bg border border-glass-border rounded-xl p-1"
    >
      {pill && (
        <div
          className="absolute top-1 bottom-1 rounded-lg bg-coffee transition-all duration-250 ease-out"
          style={{ left: pill.left, width: pill.width }}
        />
      )}
      {VIEW_TABS.map((tab, i) => {
        const Icon = tab.icon;
        const active = view === tab.value;
        return (
          <button
            key={tab.value}
            ref={(el) => { btnRefs.current[i] = el; }}
            onClick={() => setView(tab.value)}
            className={cn(
              'relative z-[1] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer border-none bg-transparent transition-colors duration-200',
              active ? 'text-white' : 'text-text-secondary hover:text-text-primary',
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

/* ── Summary card with animated collapse ── */

function SummaryCard({
  emp,
  empIdx,
  t,
  onEditDay,
}: {
  emp: import('@/types').AttendanceSummaryEmployee;
  empIdx: number;
  t: (key: string, fallback: string) => string;
  onEditDay?: (day: AttendanceDayStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const presentDays = emp.days.filter((d) => d.status === 'present').length;
  const absentDays = emp.days.filter((d) => d.status === 'absent').length;
  const leaveDays = emp.days.filter((d) => d.status === 'leave').length;
  const lateDays = emp.days.filter((d) => d.status === 'present' && d.isLate).length;

  return (
    <GlassCard hover={false}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-5 py-3 w-full text-left cursor-pointer bg-transparent border-none"
      >
        <Avatar name={emp.employeeName} index={empIdx} size={36} />
        <div className="flex-1 min-w-0">
          <div className="text-[15.5px] font-medium text-text-primary font-sans">
            {emp.employeeName}
          </div>
          <div className="text-[13px] text-text-tertiary font-sans">
            {emp.shiftName || t('attendance.noShift', 'No shift')}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <span className="text-[12.5px] font-medium px-2 py-0.5 rounded-full bg-green/10 text-green">
            {presentDays} {t('attendance.present', 'present')}
          </span>
          {absentDays > 0 && (
            <span className="text-[12.5px] font-medium px-2 py-0.5 rounded-full bg-red/10 text-red">
              {absentDays} {t('attendance.absent', 'absent')}
            </span>
          )}
          {lateDays > 0 && (
            <span className="text-[12.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
              {lateDays} {t('attendance.late', 'late')}
            </span>
          )}
          {leaveDays > 0 && (
            <span className="text-[12.5px] font-medium px-2 py-0.5 rounded-full bg-[#3B6FA0]/10 text-blue">
              {leaveDays} {t('attendance.onLeave', 'on leave')}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn(
            'text-text-tertiary transition-transform duration-250 ease-out shrink-0',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-250 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="divide-y divide-cream-3/40 border-t border-cream-3/60">
            {emp.days.map((day) => {
              const canEdit = !!onEditDay && day.status === 'present' && !!day.attendancePublicId;
              return (
                <div
                  key={day.date}
                  className="flex items-center gap-3 px-5 py-2 transition-colors duration-[120ms] hover:bg-cream-3/35 cursor-default"
                >
                  <div className="w-[72px] text-[13.5px] text-text-secondary font-sans">
                    {formatDayLabel(day.date)}
                  </div>
                  <div className="flex-1 text-[14px] font-mono tabular-nums text-text-secondary flex items-center gap-2">
                    {day.status === 'present' && (
                      <>
                        <span>
                          {day.checkInAt}
                          {day.checkOutAt ? ` \u2192 ${day.checkOutAt}` : ''}
                        </span>
                        {day.editedAt && (
                          <span
                            title={t('attendance.editedTooltip', 'Edited by a manager')}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-coffee/10 text-coffee"
                          >
                            {t('attendance.editedBadge', 'Edited')}
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
                      aria-label={t('attendance.editAria', 'Edit attendance')}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none text-text-tertiary hover:text-coffee hover:bg-cream-3/40 cursor-pointer transition-colors"
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

function EmptyState({ t }: { t: (key: string, fallback: string) => string }) {
  return (
    <div className="border-[1.5px] border-dashed border-cream-3 rounded-2xl bg-glass-bg backdrop-blur-md flex flex-col items-center justify-center min-h-[200px]">
      <ClipboardList size={28} className="text-text-tertiary mb-2" />
      <span className="text-[15px] text-text-tertiary">
        {t('attendance.noRecords', 'No attendance records for this period')}
      </span>
    </div>
  );
}
