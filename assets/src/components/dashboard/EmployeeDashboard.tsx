import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import {
  Clock,
  LogIn,
  LogOut,
  CalendarDays,
  CalendarOff,
  Loader2,
  MapPinOff,
} from 'lucide-react';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { useCheckinStatus, useCheckinAction } from '@/hooks/queries/useCheckin';
import { useWorkspace } from '@/hooks/queries/useWorkspaces';
import { getWorkspacePublicId } from '@/lib/auth';
import { useLeaveRequests } from '@/hooks/queries/useLeaveRequests';
import { Avatar } from '@/components/shared/Avatar';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader } from '@/components/layout/PageHeader';

function formatTime(time: string | null): string {
  if (!time) return '--:--';
  // Already in HH:mm format from the API
  return time;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function EmployeeDashboard() {
  const { t } = useTranslation();
  const { data: ctx, isLoading: ctxLoading } = useRoleContext();

  const employee = ctx?.employee ?? null;
  const workspaceId = getWorkspacePublicId() || '';
  const { data: workspace } = useWorkspace(workspaceId);
  const workspaceQrToken = workspace?.qrToken ?? '';

  const { data: checkinData, isLoading: checkinLoading, refetch } = useCheckinStatus(workspaceQrToken);
  const checkinAction = useCheckinAction(workspaceQrToken);

  const [actionError, setActionError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const handleCheckin = useCallback(async () => {
    setActionError(null);
    setLocationDenied(false);

    const performCheckin = async (coords?: { latitude: number; longitude: number }) => {
      try {
        await checkinAction.mutateAsync(coords);
        refetch();
      } catch (err: unknown) {
        const message =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response: { data: { message: string } } }).response?.data?.message
            : t('checkin.failed', 'Check-in failed. Please try again.');
        setActionError(message);
      }
    };

    if (!navigator.geolocation) {
      await performCheckin();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await performCheckin({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      async () => {
        setLocationDenied(true);
        await performCheckin();
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, [checkinAction, refetch, t]);

  if (ctxLoading) {
    return (
      <div className="page-enter">
        <PageHeader title={t('nav.dashboard')} />
        <p className="text-text-tertiary text-[13px] font-sans">{t('common.loading', 'Loading...')}</p>
      </div>
    );
  }

  if (!employee || !workspaceId) {
    return (
      <div className="page-enter">
        <PageHeader title={t('nav.dashboard')} />
        <GlassCard hover={false}>
          <div className="p-8 text-center space-y-3">
            <p className="text-[13.5px] text-text-secondary font-sans">
              {t('dashboard.noEmployee', 'Your account is not linked to an employee profile yet.')}
            </p>
            <p className="text-[12px] text-text-tertiary font-sans">
              Ask your employer to link your account, or enter your employee ID on your profile page.
            </p>
            <Link
              to="/console/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white no-underline transition-all hover:bg-coffee-light"
            >
              Go to profile
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  const today = checkinData?.today ?? null;
  const checkedIn = today?.checkedIn ?? false;
  const checkedOut = today?.checkedOut ?? false;
  const completed = checkedIn && checkedOut;

  const now = new Date();
  const todayStr = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="page-enter">
      {/* Header with avatar and name */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={employee.name} index={0} size={48} radius="14px" />
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary leading-tight font-serif">
            {t('dashboard.welcomeBack', 'Welcome back')}, {employee.name.split(' ')[0]}
          </h1>
          <p className="text-[13px] text-text-tertiary font-sans mt-0.5">{todayStr}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* My shift today */}
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t('dashboard.myShift', 'My shift today')}
            action={<Clock size={14} className="text-text-tertiary" />}
          />
          <div className="px-5 py-4">
            {checkinData?.shiftName ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-light to-coffee">
                  <Clock size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-text-primary font-sans">
                    {checkinData.shiftName}
                  </p>
                  <p className="text-[12.5px] text-text-secondary font-mono tabular-nums">
                    {checkinData.shiftStart} &ndash; {checkinData.shiftEnd}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-text-tertiary font-sans">
                {t('dashboard.noShiftAssigned', 'No shift assigned')}
              </p>
            )}
          </div>
        </GlassCard>

        {/* My status */}
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t('dashboard.myStatus', 'My status')}
            action={
              checkedIn ? (
                <StatusBadge
                  label={completed ? t('dashboard.completed', 'Completed') : t('dashboard.checkedIn', 'Checked in')}
                  variant={completed ? 'green' : 'blue'}
                />
              ) : (
                <StatusBadge label={t('dashboard.notCheckedIn', 'Not checked in')} variant="gray" />
              )
            }
          />
          <div className="px-5 py-4">
            {checkinLoading ? (
              <div className="flex items-center gap-2 text-[13px] text-text-tertiary font-sans">
                <Loader2 size={14} className="animate-spin" />
                {t('common.loading', 'Loading...')}
              </div>
            ) : checkedIn ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <LogIn size={14} className="text-green" />
                  <span className="text-[13px] text-text-primary font-sans">
                    {t('dashboard.checkInTime', 'Check-in')}:
                  </span>
                  <span className="text-[12.5px] text-text-secondary font-mono tabular-nums">
                    {formatTime(today?.checkInAt ?? null)}
                  </span>
                  {today?.isLate && (
                    <StatusBadge label={t('dashboard.lateLabel', 'Late')} variant="amber" />
                  )}
                </div>
                {checkedOut && (
                  <div className="flex items-center gap-2">
                    <LogOut size={14} className="text-blue" />
                    <span className="text-[13px] text-text-primary font-sans">
                      {t('dashboard.checkOutTime', 'Check-out')}:
                    </span>
                    <span className="text-[12.5px] text-text-secondary font-mono tabular-nums">
                      {formatTime(today?.checkOutAt ?? null)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[13px] text-text-secondary font-sans">
                  {t('dashboard.readyToCheckIn', 'You have not checked in yet today.')}
                </p>

                {actionError && (
                  <div className="bg-red/10 border border-red/20 rounded-xl px-4 py-2.5 text-[12px] text-red font-medium font-sans">
                    {actionError}
                  </div>
                )}

                {locationDenied && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber font-sans">
                    <MapPinOff size={12} />
                    {t('dashboard.locationDenied', 'Location access denied. Check-in sent without location.')}
                  </div>
                )}

                <button
                  onClick={handleCheckin}
                  disabled={checkinAction.isPending}
                  className="w-full bg-coffee text-white text-[15px] font-semibold rounded-xl py-3.5 border-none cursor-pointer shadow-[0_4px_14px_rgba(107,66,38,0.30)] active:scale-[0.97] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkinAction.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t('common.loading', 'Loading...')}
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      {t('checkin.checkIn', 'Check in')}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Check-out button when checked in but not out */}
            {checkedIn && !checkedOut && (
              <div className="mt-3">
                {actionError && (
                  <div className="bg-red/10 border border-red/20 rounded-xl px-4 py-2.5 text-[12px] text-red font-medium font-sans mb-3">
                    {actionError}
                  </div>
                )}

                {locationDenied && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber font-sans mb-3">
                    <MapPinOff size={12} />
                    {t('dashboard.locationDenied', 'Location access denied. Check-in sent without location.')}
                  </div>
                )}

                <button
                  onClick={handleCheckin}
                  disabled={checkinAction.isPending}
                  className="w-full bg-glass-bg backdrop-blur-sm text-text-primary text-[14px] font-medium rounded-xl py-3 border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkinAction.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t('common.loading', 'Loading...')}
                    </>
                  ) : (
                    <>
                      <LogOut size={16} />
                      {t('checkin.checkOut', 'Check out')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Attendance KPI — this month */}
      {checkinData && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <GlassCard hover={false}>
            <div className="p-4 text-center">
              <p className="text-[24px] font-bold text-green tabular-nums">
                {today?.checkedIn ? 1 : 0}
              </p>
              <p className="text-[11px] text-text-tertiary mt-1">Days present</p>
            </div>
          </GlassCard>
          <GlassCard hover={false}>
            <div className="p-4 text-center">
              <p className="text-[24px] font-bold text-amber tabular-nums">
                {today?.isLate ? 1 : 0}
              </p>
              <p className="text-[11px] text-text-tertiary mt-1">Late arrivals</p>
            </div>
          </GlassCard>
          <GlassCard hover={false}>
            <div className="p-4 text-center">
              <p className="text-[24px] font-bold text-coffee tabular-nums">
                {today?.checkedIn && !today?.isLate ? '100%' : today?.checkedIn ? '0%' : '—'}
              </p>
              <p className="text-[11px] text-text-tertiary mt-1">On-time rate</p>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Recent attendance - last 7 days */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t('dashboard.recentAttendance', 'My recent attendance')}
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
            {checkinData ? (
              (() => {
                const days: {
                  date: string;
                  label: string;
                  checkedIn: boolean;
                  checkInAt: string | null;
                  checkOutAt: string | null;
                  isLate: boolean;
                }[] = [];

                // Build last 7 days from today's data and placeholders
                const todayDate = new Date();
                for (let i = 0; i < 7; i++) {
                  const d = new Date(todayDate);
                  d.setDate(d.getDate() - i);
                  const dateStr = d.toISOString().split('T')[0];
                  const label = formatDate(dateStr);

                  if (i === 0 && today) {
                    days.push({
                      date: dateStr,
                      label,
                      checkedIn: today.checkedIn,
                      checkInAt: today.checkInAt,
                      checkOutAt: today.checkOutAt,
                      isLate: today.isLate,
                    });
                  } else {
                    days.push({
                      date: dateStr,
                      label,
                      checkedIn: false,
                      checkInAt: null,
                      checkOutAt: null,
                      isLate: false,
                    });
                  }
                }

                return days.map((day) => (
                  <div
                    key={day.date}
                    className="flex items-center gap-3 px-5 py-2.5 transition-colors duration-[120ms] hover:bg-cream-3/35 cursor-default"
                  >
                    <CalendarDays size={14} className="text-text-tertiary flex-shrink-0" />
                    <span className="text-[13px] text-text-primary font-sans flex-1">
                      {day.label}
                    </span>
                    {day.checkedIn ? (
                      <>
                        <span className="text-[12.5px] text-text-secondary font-mono tabular-nums">
                          {formatTime(day.checkInAt)}
                          {day.checkOutAt ? ` \u2192 ${formatTime(day.checkOutAt)}` : ''}
                        </span>
                        <StatusBadge
                          label={day.isLate ? t('dashboard.lateLabel', 'Late') : t('dashboard.onTimeLabel', 'On time')}
                          variant={day.isLate ? 'amber' : 'green'}
                        />
                      </>
                    ) : (
                      <StatusBadge
                        label={day.date === new Date().toISOString().split('T')[0]
                          ? t('dashboard.notYet', 'Not yet')
                          : '\u2014'}
                        variant="gray"
                      />
                    )}
                  </div>
                ));
              })()
            ) : (
              <p className="px-5 py-8 text-center text-[13px] text-text-tertiary font-sans">
                {t('dashboard.noRecentAttendance', 'No recent attendance data')}
              </p>
            )}
          </div>
        </GlassCard>

        {/* My leave requests */}
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t('dashboard.myLeaveRequests', 'My leave requests')}
            action={
              <Link
                to="/console/leave"
                className="text-xs text-amber font-medium cursor-pointer no-underline"
              >
                {t('dashboard.viewAll', 'View all')} &rarr;
              </Link>
            }
          />
          <div className="px-5 py-4">
            {employee.workspacePublicId ? (
              <EmployeeLeaveList
                workspacePublicId={employee.workspacePublicId}
                employeeName={employee.name}
              />
            ) : (
              <p className="text-[13px] text-text-tertiary font-sans text-center py-4">
                {t('dashboard.noWorkspace', 'No workspace linked')}
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function EmployeeLeaveList({
  workspacePublicId,
  employeeName,
}: {
  workspacePublicId: string;
  employeeName: string;
}) {
  const { t } = useTranslation();
  const { data: leaves, isLoading } = useLeaveRequests(workspacePublicId);

  if (isLoading) {
    return (
      <p className="text-[13px] text-text-tertiary font-sans">
        {t('common.loading', 'Loading...')}
      </p>
    );
  }

  // Filter to only this employee's leaves and take the 5 most recent
  const myLeaves = (leaves ?? [])
    .filter((l) => l.employeeName === employeeName)
    .slice(0, 5);

  if (myLeaves.length === 0) {
    return (
      <p className="text-[13px] text-text-tertiary font-sans text-center py-2">
        {t('dashboard.noLeaveRequests', 'No leave requests')}
      </p>
    );
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green' as const;
      case 'rejected':
        return 'red' as const;
      default:
        return 'amber' as const;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return t('leave.approved', 'Approved');
      case 'rejected':
        return t('leave.rejected', 'Rejected');
      default:
        return t('leave.pending', 'Pending');
    }
  };

  return (
    <div className="space-y-2">
      {myLeaves.map((leave) => (
        <div
          key={leave.publicId}
          className="flex items-center gap-3 py-2 transition-colors duration-[120ms]"
        >
          <CalendarOff size={14} className="text-text-tertiary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[13px] text-text-primary font-sans">
              {formatDate(leave.startDate)}
              {leave.startDate !== leave.endDate && ` \u2013 ${formatDate(leave.endDate)}`}
            </p>
            {leave.reason && (
              <p className="text-[11px] text-text-tertiary font-sans truncate max-w-[200px]">
                {leave.reason}
              </p>
            )}
          </div>
          <StatusBadge label={statusLabel(leave.status)} variant={statusVariant(leave.status)} />
        </div>
      ))}
    </div>
  );
}
