import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ClipboardList, GanttChart, LayoutGrid, List } from 'lucide-react';
import { useAttendance } from '@/hooks/queries/useAttendance';
import { useAttendanceSummary } from '@/hooks/queries/useAttendanceSummary';
import { useEmployees } from '@/hooks/queries/useEmployees';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { AttendanceRow } from '@/components/shared/AttendanceRow';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Avatar } from '@/components/shared/Avatar';
import { useDateFormat } from '@/hooks/useDateFormat';
import { cn } from '@/lib/utils';
import type { AttendanceDayStatus } from '@/types';

type ViewMode = 'gantt' | 'summary' | 'log';

function getStartOfMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-01`;
}

function getEndOfMonth(): string {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return `${last.getFullYear()}-${(last.getMonth() + 1).toString().padStart(2, '0')}-${last.getDate().toString().padStart(2, '0')}`;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getSearchParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    from: params.get('from') || getStartOfMonth(),
    to: params.get('to') || getToday(),
    employee: params.get('employee') || '',
    view: (params.get('view') || 'gantt') as ViewMode,
  };
}

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
  const d = new Date(dateStr + 'T00:00:00');
  const weekday = d.toLocaleDateString('en', { weekday: 'short' });
  const day = d.getDate();
  return `${weekday} ${day}`;
}

/** Letter code + color for the Gantt grid cell */
function ganttCell(day: AttendanceDayStatus): { code: string; bg: string; text: string; title: string } {
  switch (day.status) {
    case 'present':
      if (day.isLate)
        return { code: 'Lt', bg: 'bg-amber/15', text: 'text-amber', title: `Late \u2014 ${day.checkInAt || ''}` };
      if (day.leftEarly)
        return { code: 'E', bg: 'bg-amber/15', text: 'text-amber', title: `Left early \u2014 ${day.checkOutAt || ''}` };
      return { code: 'P', bg: 'bg-green/12', text: 'text-green', title: `Present \u2014 ${day.checkInAt || ''}${day.checkOutAt ? ` \u2192 ${day.checkOutAt}` : ''}` };
    case 'absent':
      return { code: 'A', bg: 'bg-red/12', text: 'text-red', title: 'Absent' };
    case 'leave':
      return { code: 'Lv', bg: 'bg-[#3B6FA0]/12', text: 'text-blue', title: day.leaveType === 'paid' ? 'Paid leave' : 'Unpaid leave' };
    case 'closure':
      return { code: 'C', bg: 'bg-[#AE9D95]/10', text: 'text-text-tertiary', title: 'Closed' };
    case 'upcoming':
      return { code: '\u2013', bg: '', text: 'text-text-tertiary/40', title: 'Upcoming' };
  }
}

export const Route = createFileRoute('/console/attendance/')({
  component: AttendancePage,
});

function AttendancePage() {
  const { t } = useTranslation();
  const initial = getSearchParams();
  const [from, setFromState] = useState(initial.from);
  const [to, setToState] = useState(initial.to);
  const [employeeFilter, setEmployeeFilterState] = useState(initial.employee);
  const [view, setViewState] = useState<ViewMode>(initial.view);
  const workspaceId = getWorkspacePublicId() || '';
  const { data: attendance, isLoading } = useAttendance(workspaceId, from, to);
  const { data: summary, isLoading: summaryLoading } = useAttendanceSummary(workspaceId, from, to);
  const { data: employees } = useEmployees(workspaceId);
  const { data: roleContext, isLoading: roleLoading } = useRoleContext();
  const fmtDate = useDateFormat();

  const isManager = roleContext?.isManager ?? false;
  const isEmployee = !!roleContext && roleContext.isEmployee && !roleContext.isOwner && !isManager;
  const employeePublicId = roleContext?.employee?.publicId;

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
      const newTo = getEndOfMonth();
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
      <PageHeader title={isEmployee ? t('nav.myAttendance', 'My Attendance') : t('nav.attendance')} />

      <p className="text-[15px] text-text-secondary mb-5 -mt-2 leading-relaxed">
        {isEmployee
          ? t('attendance.employeeDescription', 'Your check-in and check-out history. Filter by date range.')
          : t('attendance.ownerDescription', 'View check-in and check-out records for all employees. Filter by date range or employee.')}
      </p>

      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label id="attendance-from-label" className="block text-[13px] font-medium text-text-secondary mb-1">
            {t('attendance.from', 'From')}
          </label>
          <CustomDatePicker value={from} onChange={setFrom} />
        </div>
        <div>
          <label id="attendance-to-label" className="block text-[13px] font-medium text-text-secondary mb-1">
            {t('attendance.to', 'To')}
          </label>
          <CustomDatePicker value={to} onChange={setTo} />
        </div>
        {!isEmployee && (
          <div className="w-48">
            <label id="attendance-employee-label" className="block text-[13px] font-medium text-text-secondary mb-1">
              {t('attendance.employee', 'Employee')}
            </label>
            <CustomSelect
              value={employeeFilter}
              onChange={setEmployeeFilter}
              options={employeeOptions}
              placeholder={t('attendance.allEmployees', 'All employees')}
            />
          </div>
        )}
        <div className="flex gap-1 ml-auto bg-glass-bg border border-glass-border rounded-xl p-1">
          <button
            onClick={() => setView('gantt')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer border-none',
              view === 'gantt'
                ? 'bg-coffee text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-cream-3/50 bg-transparent',
            )}
          >
            <GanttChart size={14} />
            {t('attendance.gantt', 'Monthly')}
          </button>
          <button
            onClick={() => setView('summary')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer border-none',
              view === 'summary'
                ? 'bg-coffee text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-cream-3/50 bg-transparent',
            )}
          >
            <LayoutGrid size={14} />
            {t('attendance.summary', 'Summary')}
          </button>
          <button
            onClick={() => setView('log')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer border-none',
              view === 'log'
                ? 'bg-coffee text-white'
                : 'text-text-secondary hover:text-text-primary hover:bg-cream-3/50 bg-transparent',
            )}
          >
            <List size={14} />
            {t('attendance.log', 'Log')}
          </button>
        </div>
      </div>

      {/* ── Legend (shown for gantt and summary) ── */}
      {view !== 'log' && (
        <div className="flex flex-wrap gap-3 mb-4 text-[12px] font-medium">
          <span className="flex items-center gap-1"><span className="inline-block w-5 h-5 rounded bg-green/12 text-green text-center leading-5 font-mono text-[11px]">P</span> Present</span>
          <span className="flex items-center gap-1"><span className="inline-block w-5 h-5 rounded bg-red/12 text-red text-center leading-5 font-mono text-[11px]">A</span> Absent</span>
          <span className="flex items-center gap-1"><span className="inline-block w-5 h-5 rounded bg-amber/15 text-amber text-center leading-5 font-mono text-[11px]">Lt</span> Late</span>
          <span className="flex items-center gap-1"><span className="inline-block w-5 h-5 rounded bg-amber/15 text-amber text-center leading-5 font-mono text-[11px]">E</span> Early leave</span>
          <span className="flex items-center gap-1"><span className="inline-block w-5 h-5 rounded bg-[#3B6FA0]/12 text-blue text-center leading-5 font-mono text-[11px]">Lv</span> Leave</span>
          <span className="flex items-center gap-1"><span className="inline-block w-5 h-5 rounded bg-[#AE9D95]/10 text-text-tertiary text-center leading-5 font-mono text-[11px]">C</span> Closed</span>
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
                    <th className="sticky left-0 z-10 bg-glass-bg backdrop-blur-md text-left px-3 py-2.5 text-[13px] font-semibold text-text-primary border-b border-cream-3/60 min-w-[140px]">
                      {t('attendance.employee', 'Employee')}
                    </th>
                    {ganttDays.map((day) => {
                      const d = new Date(day.date + 'T00:00:00');
                      const dayNum = d.getDate();
                      const weekday = d.toLocaleDateString('en', { weekday: 'narrow' });
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                      return (
                        <th
                          key={day.date}
                          className={cn(
                            'px-0.5 py-2 text-center font-medium border-b border-cream-3/60 min-w-[32px]',
                            isWeekend ? 'text-text-tertiary/60' : 'text-text-secondary',
                          )}
                        >
                          <div className="text-[10px] leading-tight">{weekday}</div>
                          <div className="text-[12px] tabular-nums leading-tight">{dayNum}</div>
                        </th>
                      );
                    })}
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-text-secondary border-b border-cream-3/60 min-w-[32px]">P</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-red border-b border-cream-3/60 min-w-[32px]">A</th>
                    <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-amber border-b border-cream-3/60 min-w-[32px]">Lt</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSummary.map((emp, empIdx) => {
                    const presentCount = emp.days.filter((d) => d.status === 'present').length;
                    const absentCount = emp.days.filter((d) => d.status === 'absent').length;
                    const lateCount = emp.days.filter((d) => d.status === 'present' && d.isLate).length;

                    return (
                      <tr key={emp.employeePublicId} className="hover:bg-cream-3/25 transition-colors duration-[120ms]">
                        <td className="sticky left-0 z-10 bg-glass-bg backdrop-blur-md px-3 py-2 border-b border-cream-3/30">
                          <div className="flex items-center gap-2">
                            <Avatar name={emp.employeeName} index={empIdx} size={26} />
                            <div>
                              <div className="text-[13px] font-medium text-text-primary leading-tight truncate max-w-[120px]">
                                {emp.employeeName}
                              </div>
                              <div className="text-[10.5px] text-text-tertiary leading-tight">
                                {emp.shiftName || 'No shift'}
                              </div>
                            </div>
                          </div>
                        </td>
                        {emp.days.map((day) => {
                          const cell = ganttCell(day);
                          return (
                            <td key={day.date} className="px-0.5 py-1.5 text-center border-b border-cream-3/30">
                              <span
                                title={cell.title}
                                className={cn(
                                  'inline-flex items-center justify-center w-[28px] h-[24px] rounded text-[11px] font-semibold font-mono cursor-default',
                                  cell.bg,
                                  cell.text,
                                )}
                              >
                                {cell.code}
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-center text-[12px] font-semibold text-green tabular-nums border-b border-cream-3/30">{presentCount}</td>
                        <td className="px-3 py-2 text-center text-[12px] font-semibold text-red tabular-nums border-b border-cream-3/30">{absentCount}</td>
                        <td className="px-3 py-2 text-center text-[12px] font-semibold text-amber tabular-nums border-b border-cream-3/30">{lateCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )
      ) : view === 'summary' ? (
        /* ── Summary view ── */
        !filteredSummary?.length ? (
          <EmptyState t={t} />
        ) : (
          <div className="flex flex-col gap-4">
            {filteredSummary.map((emp, empIdx) => {
              const presentDays = emp.days.filter((d) => d.status === 'present').length;
              const absentDays = emp.days.filter((d) => d.status === 'absent').length;
              const leaveDays = emp.days.filter((d) => d.status === 'leave').length;
              const lateDays = emp.days.filter((d) => d.status === 'present' && d.isLate).length;

              return (
                <GlassCard key={emp.employeePublicId} hover={false}>
                  <div className="flex items-center gap-3 px-5 py-3 border-b border-cream-3/60">
                    <Avatar name={emp.employeeName} index={empIdx} size={36} />
                    <div className="flex-1">
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
                  </div>
                  <div className="divide-y divide-cream-3/40">
                    {emp.days.map((day) => (
                      <div
                        key={day.date}
                        className="flex items-center gap-3 px-5 py-2 transition-colors duration-[120ms] hover:bg-cream-3/35 cursor-default"
                      >
                        <div className="w-[72px] text-[13.5px] text-text-secondary font-sans">
                          {formatDayLabel(day.date)}
                        </div>
                        <div className="flex-1 text-[14px] font-mono tabular-nums text-text-secondary">
                          {day.status === 'present' && (
                            <>
                              {day.checkInAt}
                              {day.checkOutAt ? ` \u2192 ${day.checkOutAt}` : ''}
                            </>
                          )}
                        </div>
                        {dayStatusBadge(day)}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              );
            })}
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
                  time={a.checkInAt}
                  checkOut={a.checkOutAt}
                  isLate={a.isLate}
                  leftEarly={a.leftEarly}
                  index={i}
                />
              ))}
            </div>
          </GlassCard>
        )
      )}
    </div>
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
