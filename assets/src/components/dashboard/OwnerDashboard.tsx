import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { UserPlus, ClipboardList, CalendarOff } from 'lucide-react';
import { useDashboard } from '@/hooks/queries/useDashboard';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { AttendanceRow } from '@/components/shared/AttendanceRow';
import { StatusBadge } from '@/components/shared/StatusBadge';

export function OwnerDashboard() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || '';
  const { data, isLoading } = useDashboard(workspaceId);

  if (!workspaceId) {
    return (
      <div className="page-enter">
        <PageHeader title={t('nav.dashboard')} />
        <GlassCard hover={false}>
          <div className="p-8 text-center">
            <p className="text-[13.5px] text-[#7C6860] mb-4 font-sans">
              {t('dashboard.noWorkspace', 'No workspace selected. Create one to get started.')}
            </p>
            <Link
              to="/console/settings"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-[#6B4226] text-white no-underline transition-all duration-150 hover:bg-[#9B6B45] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
            >
              {t('dashboard.goToSettings', 'Go to settings')}
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="page-enter">
        <PageHeader title={t('nav.dashboard')} />
        <p className="text-[#AE9D95] text-[13px] font-sans">{t('common.loading', 'Loading...')}</p>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <PageHeader
        title={t('nav.dashboard')}
        action={
          data.pendingLeaves > 0 ? (
            <Link
              to="/console/leave"
              className="inline-flex items-center gap-2 no-underline"
            >
              <CalendarOff size={14} className="text-[#C17F3B]" />
              <span className="text-[13px] text-[#7C6860] font-sans">
                {t('dashboard.pendingLeaves', 'Pending leaves')}
              </span>
              <StatusBadge
                label={String(data.pendingLeaves)}
                variant="amber"
              />
            </Link>
          ) : undefined
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={t('dashboard.present', 'Present today')}
          value={data.present}
          subtitle={t('dashboard.ofEmployees', { count: data.totalEmployees, defaultValue: `of ${data.totalEmployees} employees` })}
          accent="#4A7C59"
          emoji="&#10004;"
        />
        <StatCard
          label={t('dashboard.late', 'Late')}
          value={data.late}
          subtitle={t('dashboard.ofEmployees', { count: data.totalEmployees, defaultValue: `of ${data.totalEmployees} employees` })}
          accent="#C17F3B"
          emoji="&#9200;"
        />
        <StatCard
          label={t('dashboard.onLeave', 'On leave')}
          value={data.onLeave}
          subtitle={`${data.pendingLeaves} ${t('dashboard.pending', 'pending')}`}
          accent="#3B6FA0"
          emoji="&#127796;"
        />
        <StatCard
          label={t('dashboard.absent', 'Absent')}
          value={data.absent}
          subtitle={t('dashboard.ofEmployees', { count: data.totalEmployees, defaultValue: `of ${data.totalEmployees} employees` })}
          accent="#C0392B"
          emoji="&#10060;"
        />
      </div>

      {/* Today's attendance */}
      <GlassCard hover={false} className="mb-6">
        <GlassCardHeader
          title={t('dashboard.todayAttendance', "Today's attendance")}
          action={
            <Link
              to="/console/attendance"
              className="text-xs text-[#C17F3B] font-medium cursor-pointer no-underline"
            >
              {t('dashboard.viewAll', 'View all')} &rarr;
            </Link>
          }
        />
        <div>
          {data.recentAttendance.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-[#AE9D95] font-sans">
              {t('dashboard.noAttendance', 'No attendance records yet today')}
            </p>
          ) : (
            data.recentAttendance.map((record, i) => (
              <AttendanceRow
                key={record.publicId}
                employee={record.employeeName}
                shift={record.shiftName}
                time={record.checkInAt}
                checkOut={record.checkOutAt}
                isLate={record.isLate}
                leftEarly={record.leftEarly}
                index={i}
              />
            ))
          )}
        </div>
      </GlassCard>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/console/employees/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-[#6B4226] text-white no-underline border-none cursor-pointer transition-all duration-150 hover:bg-[#9B6B45] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
        >
          <UserPlus size={14} />
          {t('dashboard.addEmployee', 'Add employee')}
        </Link>
        <Link
          to="/console/attendance"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-white/62 backdrop-blur-sm text-[#2C2420] border border-[#EBE2D6] no-underline cursor-pointer transition-all duration-150 hover:bg-[#EBE2D6]"
        >
          <ClipboardList size={14} />
          {t('dashboard.viewAttendance', 'View attendance')}
        </Link>
      </div>
    </div>
  );
}
