import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ClipboardList } from 'lucide-react';
import { useAttendance } from '@/hooks/queries/useAttendance';
import { useEmployees } from '@/hooks/queries/useEmployees';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { AttendanceRow } from '@/components/shared/AttendanceRow';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import { CustomSelect } from '@/components/shared/CustomSelect';
import { useDateFormat } from '@/hooks/useDateFormat';
import { useWorkspaceTimezone } from '@/hooks/useWorkspaceTimezone';

function getSearchParams(today: () => string, startOfMonth: () => string) {
  const params = new URLSearchParams(window.location.search);
  return {
    from: params.get('from') || startOfMonth(),
    to: params.get('to') || today(),
    employee: params.get('employee') || '',
  };
}

function updateSearchParams(from: string, to: string, employee: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('from', from);
  url.searchParams.set('to', to);
  if (employee) url.searchParams.set('employee', employee);
  else url.searchParams.delete('employee');
  window.history.replaceState({}, '', url.toString());
}

export const Route = createFileRoute('/console/attendance/')({
  component: AttendancePage,
});

function AttendancePage() {
  const { t } = useTranslation();
  const wsTz = useWorkspaceTimezone();
  const initial = getSearchParams(wsTz.today, wsTz.startOfMonth);
  const [from, setFromState] = useState(initial.from);
  const [to, setToState] = useState(initial.to);
  const [employeeFilter, setEmployeeFilterState] = useState(initial.employee);
  const workspaceId = getWorkspacePublicId() || '';
  const { data: attendance, isLoading } = useAttendance(workspaceId, from, to);
  const { data: employees } = useEmployees(workspaceId);
  const { data: roleContext, isLoading: roleLoading } = useRoleContext();
  const fmtDate = useDateFormat();

  const isManager = roleContext?.isManager ?? false;
  const isEmployee = !!roleContext && roleContext.isEmployee && !roleContext.isOwner && !isManager;
  const employeePublicId = roleContext?.employee?.publicId;

  const setFrom = (value: string) => {
    setFromState(value);
    updateSearchParams(value, to, employeeFilter);
  };

  const setTo = (value: string) => {
    setToState(value);
    updateSearchParams(from, value, employeeFilter);
  };

  const setEmployeeFilter = (value: string) => {
    setEmployeeFilterState(value);
    updateSearchParams(from, to, value);
  };

  // For employees, always filter to their own records; for owners, use the dropdown filter
  const activeFilter = isEmployee && employeePublicId ? employeePublicId : employeeFilter;
  const filtered = activeFilter
    ? attendance?.filter((a) => a.employeePublicId === activeFilter)
    : attendance;

  const employeeOptions = [
    { value: '', label: t('attendance.allEmployees', 'All employees') },
    ...(employees?.map((e) => ({ value: e.publicId, label: e.name })) ?? []),
  ];

  if (roleLoading) {
    return (
      <div className="page-enter">
        <PageHeader title={t('nav.attendance')} />
        <p className="text-text-tertiary">{t('common.loading')}</p>
      </div>
    );
  }

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
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[15px] text-text-tertiary">{t('common.loading')}</p>
        </div>
      ) : filtered?.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-cream-3 rounded-2xl bg-glass-bg backdrop-blur-md flex flex-col items-center justify-center min-h-[200px]">
          <ClipboardList size={28} className="text-text-tertiary mb-2" />
          <span className="text-[15px] text-text-tertiary">
            {t('attendance.noRecords', 'No attendance records for this period')}
          </span>
        </div>
      ) : (
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t('attendance.log', 'Attendance log')}
            action={
              <span className="flex items-center gap-1.5 text-[14px] text-text-tertiary">
                <CalendarDays size={13} />
                {from === to ? fmtDate(from) : `${fmtDate(from)} – ${fmtDate(to)}`}
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
      )}
    </div>
  );
}
