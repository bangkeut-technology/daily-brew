import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { UserPlus, ClipboardList, CalendarOff, Clock, Settings, CheckCircle, AlertTriangle, Palmtree, XCircle, Coffee, Copy, QrCode, Crown, CalendarDays } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { useDashboard } from '@/hooks/queries/useDashboard';
import { useWorkspaces } from '@/hooks/queries/useWorkspaces';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { AttendanceRow } from '@/components/shared/AttendanceRow';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GuidedTour } from '@/components/shared/GuidedTour';
import { usePlan } from '@/hooks/queries/usePlan';
import { useLeaveRequests } from '@/hooks/queries/useLeaveRequests';
import { useClosures } from '@/hooks/queries/useClosures';
import { usePaddle } from '@/hooks/usePaddle';
import { useDateFormat } from '@/hooks/useDateFormat';

export function OwnerDashboard() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || '';
  const { data, isLoading } = useDashboard(workspaceId);
  const { data: workspaces } = useWorkspaces();
  const { data: plan } = usePlan(workspaceId);
  const canUseLeave = plan?.canUseLeaveRequests ?? false;
  const { data: leaveRequests } = useLeaveRequests(canUseLeave ? workspaceId : '');
  const { openCheckout } = usePaddle();
  const fmtDate = useDateFormat();
  const { data: closures } = useClosures(workspaceId);
  const currentWs = workspaces?.find((ws) => ws.publicId === workspaceId);

  // Current + upcoming closures
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeClosures = (closures ?? []).filter((c) => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return today >= start && today <= end;
  });
  const upcomingClosures = (closures ?? []).filter((c) => {
    const start = new Date(c.startDate);
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    return start > today && start <= in30Days;
  }).slice(0, 3);

  // Upcoming approved leaves (next 14 days)
  const upcomingLeaves = (leaveRequests ?? [])
    .filter((lr) => {
      if (lr.status !== 'approved') return false;
      const start = new Date(lr.startDate);
      const now = new Date();
      const in14Days = new Date();
      in14Days.setDate(in14Days.getDate() + 14);
      return start >= now && start <= in14Days;
    })
    .slice(0, 5);

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

        <div className="border-[1.5px] border-dashed border-cream-3 rounded-2xl bg-glass-bg backdrop-blur-md flex flex-col items-center justify-center min-h-100 py-12 px-6">
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
          <div className="flex items-center gap-3">
            {data.pendingLeaves > 0 && canUseLeave && (
              <Link
                to="/console/leave"
                className="inline-flex items-center gap-2 no-underline"
              >
                <CalendarOff size={14} className="text-amber" />
                <span className="text-[13px] text-text-secondary font-sans">
                  {data.pendingLeaves} pending
                </span>
              </Link>
            )}
            {!plan?.isEspresso && (
              <button
                onClick={() => openCheckout('annual')}
                className="text-[11px] font-medium text-amber bg-transparent border-none cursor-pointer hover:underline"
              >
                Upgrade
              </button>
            )}
          </div>
        }
      />

      <GuidedTour />

      {/* Welcome + summary text */}
      <div className="mb-6">
        <p className="text-[13.5px] text-text-secondary leading-relaxed">
          {data.totalEmployees === 0
            ? 'Get started by adding your first employee and creating a shift.'
            : data.present === data.totalEmployees
              ? `All ${data.totalEmployees} employees are present today. Great job!`
              : data.present === 0
                ? `None of your ${data.totalEmployees} employees have checked in yet today.`
                : `${data.present} of ${data.totalEmployees} employees checked in today.${data.late > 0 ? ` ${data.late} arrived late.` : ''}${data.absent > 0 ? ` ${data.absent} absent.` : ''}`
          }
        </p>
      </div>

      {/* QR Check-in card */}
      {currentWs?.qrToken && (
        <GlassCard hover={false} className="mb-6">
          <div className="p-5 flex items-center gap-5">
            <div className="p-3 bg-white rounded-xl shadow-[0_2px_8px_rgba(107,66,38,0.06)] shrink-0">
              <QRCodeSVG
                value={`dailybrew:ws:${currentWs.qrToken}`}
                size={80}
                fgColor="#6B4226"
                bgColor="#FFFFFF"
                level="M"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <QrCode size={15} className="text-coffee" />
                <h3 className="text-[14px] font-semibold text-text-primary">Check-in QR code</h3>
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed mb-3">
                Print and display this at your restaurant. Employees scan it with the DailyBrew app to check in and out.
              </p>
              <div className="flex items-center gap-2">
                <code className="text-[11px] font-mono text-text-tertiary bg-cream-3/30 px-2 py-1 rounded">
                  dailybrew:ws:{currentWs.qrToken}
                </code>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(currentWs.qrToken);
                      toast.success('Token copied');
                    } catch {
                      toast.error('Failed to copy');
                    }
                  }}
                  className="text-text-tertiary hover:text-coffee bg-transparent border-none cursor-pointer p-1 rounded transition-colors"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

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

      {/* Insights row */}
      {data.totalEmployees > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <GlassCard hover={false}>
            <div className="p-4">
              <p className="text-[11px] text-text-tertiary uppercase tracking-[1px] mb-1">Attendance rate</p>
              <p className="text-[28px] font-bold text-coffee tabular-nums">
                {data.totalEmployees > 0 ? Math.round((data.present / data.totalEmployees) * 100) : 0}%
              </p>
              <p className="text-[11px] text-text-tertiary mt-1">
                {data.present} present out of {data.totalEmployees} employees
              </p>
            </div>
          </GlassCard>
          <GlassCard hover={false}>
            <div className="p-4">
              <p className="text-[11px] text-text-tertiary uppercase tracking-[1px] mb-1">On-time rate</p>
              <p className="text-[28px] font-bold text-green tabular-nums">
                {data.present > 0 ? Math.round(((data.present - data.late) / data.present) * 100) : 0}%
              </p>
              <p className="text-[11px] text-text-tertiary mt-1">
                {data.present - data.late} on time, {data.late} late today
              </p>
            </div>
          </GlassCard>
          <GlassCard hover={false}>
            <div className="p-4">
              <p className="text-[11px] text-text-tertiary uppercase tracking-[1px] mb-1">Leave & absent</p>
              <p className="text-[28px] font-bold text-amber tabular-nums">
                {data.onLeave + data.absent}
              </p>
              <p className="text-[11px] text-text-tertiary mt-1">
                {data.onLeave} on leave, {data.absent} absent{data.pendingLeaves > 0 ? `, ${data.pendingLeaves} pending` : ''}
              </p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Current & upcoming closures */}
      {(activeClosures.length > 0 || upcomingClosures.length > 0) && (
        <div className="mb-6">
          {activeClosures.length > 0 && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red/8 border border-red/15 mb-3">
              <CalendarOff size={16} className="text-red shrink-0" />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-red">
                  Restaurant is closed today — {activeClosures.map((c) => c.name).join(', ')}
                </p>
                <p className="text-[11px] text-red/70">
                  No attendance is expected during this period.
                </p>
              </div>
            </div>
          )}
          {upcomingClosures.length > 0 && (
            <GlassCard hover={false}>
              <GlassCardHeader
                title="Upcoming closures"
                action={
                  <Link to="/console/closures" className="text-xs text-amber font-medium cursor-pointer no-underline">
                    Manage &rarr;
                  </Link>
                }
              />
              <div>
                {upcomingClosures.map((c) => {
                  const start = new Date(c.startDate);
                  const daysUntil = Math.round((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={c.publicId} className="flex items-center gap-3 px-5 py-3 border-b border-cream-3/50 last:border-0">
                      <CalendarOff size={14} className="text-amber shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-text-primary truncate">{c.name}</p>
                        <p className="text-[11px] text-text-tertiary">
                          {fmtDate(c.startDate)}{c.startDate !== c.endDate ? ` – ${fmtDate(c.endDate)}` : ''}
                        </p>
                      </div>
                      <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-amber/10 text-amber">
                        in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}
        </div>
      )}

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

      {/* Upcoming leaves */}
      <div className="relative mb-6">
        {!canUseLeave && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-cream/80 dark:bg-cream/60 backdrop-blur-sm">
            <Crown size={24} className="text-amber mb-2" />
            <p className="text-[14px] font-semibold text-text-primary mb-1">Upcoming leaves</p>
            <p className="text-[12px] text-text-secondary mb-3 text-center max-w-xs">
              See who's taking time off in the next 2 weeks. Upgrade to Espresso to manage leave requests.
            </p>
            <button
              onClick={() => openCheckout('annual')}
              className="px-5 py-2 rounded-xl text-[13px] font-medium text-white border-none cursor-pointer btn-shimmer transition-all hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(107,66,38,0.30)]"
            >
              Start 14-day free trial
            </button>
          </div>
        )}
        <GlassCard hover={false}>
          <GlassCardHeader
            title="Upcoming leaves"
            action={
              canUseLeave ? (
                <Link to="/console/leave" className="text-xs text-amber font-medium cursor-pointer no-underline">
                  View all &rarr;
                </Link>
              ) : (
                <StatusBadge label="Espresso" variant="amber" />
              )
            }
          />
          <div className={!canUseLeave ? 'blur-[2px] select-none pointer-events-none' : ''}>
            {canUseLeave && upcomingLeaves.length === 0 ? (
              <p className="px-5 py-6 text-center text-[13px] text-text-tertiary">
                No upcoming leaves in the next 2 weeks
              </p>
            ) : (
              <div>
                {(canUseLeave ? upcomingLeaves : [
                  { publicId: '1', employeeName: 'John Doe', startDate: '2026-04-02', endDate: '2026-04-03', status: 'approved' },
                  { publicId: '2', employeeName: 'Jane Smith', startDate: '2026-04-05', endDate: '2026-04-05', status: 'approved' },
                  { publicId: '3', employeeName: 'Alex Brown', startDate: '2026-04-10', endDate: '2026-04-12', status: 'approved' },
                ]).map((lr) => (
                  <div
                    key={lr.publicId}
                    className="flex items-center gap-3 px-5 py-3 border-b border-cream-3/50 last:border-0"
                  >
                    <CalendarDays size={14} className="text-blue shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-text-primary truncate">
                        {lr.employeeName}
                      </p>
                      <p className="text-[11px] text-text-tertiary">
                        {fmtDate(lr.startDate)}{lr.startDate !== lr.endDate ? ` – ${fmtDate(lr.endDate)}` : ''}
                      </p>
                    </div>
                    <StatusBadge label="Approved" variant="green" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

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
