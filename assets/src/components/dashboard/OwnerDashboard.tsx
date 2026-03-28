import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { UserPlus, ClipboardList, CalendarOff, Clock, Settings, CheckCircle, AlertTriangle, Palmtree, XCircle, Coffee } from 'lucide-react';
import { useDashboard } from '@/hooks/queries/useDashboard';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { AttendanceRow } from '@/components/shared/AttendanceRow';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GuidedTour } from '@/components/shared/GuidedTour';

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
            <p className="text-[13.5px] text-text-secondary mb-4 font-sans">
              {t('dashboard.noWorkspace', 'No workspace selected. Create one to get started.')}
            </p>
            <Link
              to="/console/settings"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white no-underline transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
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
        <p className="text-text-tertiary text-[13px] font-sans">{t('common.loading', 'Loading...')}</p>
      </div>
    );
  }

  if (data.totalEmployees === 0) {
    return (
      <div className="page-enter">
        <PageHeader title={t('nav.dashboard')} />
        <GuidedTour />

        <div className="border-[1.5px] border-dashed border-cream-3 rounded-2xl bg-white/30 flex flex-col items-center justify-center min-h-[400px] py-12 px-6">
          <Coffee size={48} className="text-coffee/80 mb-4" strokeWidth={1.5} />

          <h2
            className="text-[20px] font-semibold text-text-primary mb-2 text-center"
            style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif" }}
          >
            {t('dashboard.emptyWelcome')}
          </h2>

          <p className="text-[13.5px] text-text-secondary font-sans text-center max-w-md mb-8">
            {t('dashboard.emptySubtitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            <Link
              to="/console/employees/new"
              data-tour="add-employee"
              className="group no-underline"
            >
              <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
                <UserPlus size={28} className="text-text-tertiary mx-auto mb-3 group-hover:text-coffee transition-colors" />
                <p className="text-[13.5px] font-medium text-text-primary font-sans mb-1">
                  {t('dashboard.emptyAddEmployee')}
                </p>
                <p className="text-[11px] text-text-tertiary font-sans">
                  {t('dashboard.emptyAddEmployeeDesc')}
                </p>
              </div>
            </Link>

            <Link to="/console/shifts" className="group no-underline">
              <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
                <Clock size={28} className="text-text-tertiary mx-auto mb-3 group-hover:text-coffee transition-colors" />
                <p className="text-[13.5px] font-medium text-text-primary font-sans mb-1">
                  {t('dashboard.emptyCreateShift')}
                </p>
                <p className="text-[11px] text-text-tertiary font-sans">
                  {t('dashboard.emptyCreateShiftDesc')}
                </p>
              </div>
            </Link>

            <Link to="/console/settings" className="group no-underline">
              <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
                <Settings size={28} className="text-text-tertiary mx-auto mb-3 group-hover:text-coffee transition-colors" />
                <p className="text-[13.5px] font-medium text-text-primary font-sans mb-1">
                  {t('dashboard.emptyConfigure')}
                </p>
                <p className="text-[11px] text-text-tertiary font-sans">
                  {t('dashboard.emptyConfigureDesc')}
                </p>
              </div>
            </Link>
          </div>
        </div>
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
              <CalendarOff size={14} className="text-amber" />
              <span className="text-[13px] text-text-secondary font-sans">
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

      <GuidedTour />

      {/* Stats grid */}
      <div data-tour="dashboard" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={t('dashboard.present', 'Present today')}
          value={data.present}
          subtitle={t('dashboard.ofEmployees', { count: data.totalEmployees, defaultValue: `of ${data.totalEmployees} employees` })}
          accent="green"
          icon={<CheckCircle size={24} />}
        />
        <StatCard
          label={t('dashboard.late', 'Late')}
          value={data.late}
          subtitle={t('dashboard.ofEmployees', { count: data.totalEmployees, defaultValue: `of ${data.totalEmployees} employees` })}
          accent="amber"
          icon={<AlertTriangle size={24} />}
        />
        <StatCard
          label={t('dashboard.onLeave', 'On leave')}
          value={data.onLeave}
          subtitle={`${data.pendingLeaves} ${t('dashboard.pending', 'pending')}`}
          accent="blue"
          icon={<Palmtree size={24} />}
        />
        <StatCard
          label={t('dashboard.absent', 'Absent')}
          value={data.absent}
          subtitle={t('dashboard.ofEmployees', { count: data.totalEmployees, defaultValue: `of ${data.totalEmployees} employees` })}
          accent="red"
          icon={<XCircle size={24} />}
        />
      </div>

      {/* Today's attendance */}
      <GlassCard hover={false} className="mb-6">
        <GlassCardHeader
          title={t('dashboard.todayAttendance', "Today's attendance")}
          action={
            <Link
              to="/console/attendance"
              className="text-xs text-amber font-medium cursor-pointer no-underline"
            >
              {t('dashboard.viewAll', 'View all')} &rarr;
            </Link>
          }
        />
        <div>
          {data.recentAttendance.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-text-tertiary font-sans">
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
          data-tour="add-employee"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white no-underline border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)]"
        >
          <UserPlus size={14} />
          {t('dashboard.addEmployee', 'Add employee')}
        </Link>
        <Link
          to="/console/attendance"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-glass-bg backdrop-blur-sm text-text-primary border border-cream-3 no-underline cursor-pointer transition-all duration-150 hover:bg-cream-3"
        >
          <ClipboardList size={14} />
          {t('dashboard.viewAttendance', 'View attendance')}
        </Link>
      </div>
    </div>
  );
}
