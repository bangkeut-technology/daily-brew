import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import {
  Clock,
  LogIn,
  LogOut,
  CalendarDays,
  CalendarOff,
  Loader2,
  MapPinOff,
  Plus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { useCheckinStatus, useCheckinAction } from '@/hooks/queries/useCheckin';
import { useWorkspace } from '@/hooks/queries/useWorkspaces';
import { getWorkspacePublicId } from '@/lib/auth';
import { useLeaveRequests, useDeleteLeaveRequest } from '@/hooks/queries/useLeaveRequests';
import { useClosures } from '@/hooks/queries/useClosures';
import { useDateFormat } from '@/hooks/useDateFormat';
import { Avatar } from '@/components/shared/Avatar';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader } from '@/components/layout/PageHeader';
import { LeaveRequestModal } from '@/components/shared/LeaveRequestModal';
import { ConfirmModal } from '@/components/shared/ConfirmModal';

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

  const { data: closures } = useClosures(workspaceId);
  const { data: allLeaves } = useLeaveRequests(workspaceId);
  const fmtDate = useDateFormat();
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
  const onLeave = (checkinData as { onLeave?: boolean })?.onLeave ?? false;
  const leaveIsFullDay = (checkinData as { leaveIsFullDay?: boolean })?.leaveIsFullDay ?? false;

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
      <div className="flex items-center gap-4 mb-2">
        <Avatar name={employee.name} index={0} size={48} radius="14px" />
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary leading-tight font-serif">
            {t('dashboard.welcomeBack', 'Welcome back')}, {employee.name.split(' ')[0]}
          </h1>
          <p className="text-[13px] text-text-tertiary font-sans mt-0.5">{todayStr}</p>
        </div>
      </div>
      <p className="text-[13px] text-text-secondary mb-6 leading-relaxed">
        {completed
          ? 'You\'re all done for today. Your attendance has been recorded.'
          : checkedIn
            ? 'You\'re checked in. Don\'t forget to check out when your shift ends.'
            : checkinData?.shiftName
              ? `Your shift (${checkinData.shiftName}) is ${checkinData.shiftStart}–${checkinData.shiftEnd}. Scan the workspace QR code to check in.`
              : 'Scan the workspace QR code from the DailyBrew app to check in.'
        }
      </p>

      {/* Closure notice */}
      {(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const activeClosure = (closures ?? []).find((c) => {
          const s = new Date(c.startDate);
          const e = new Date(c.endDate);
          return now >= s && now <= e;
        });
        const nextClosure = (closures ?? []).find((c) => {
          const s = new Date(c.startDate);
          const in7 = new Date();
          in7.setDate(in7.getDate() + 7);
          return s > now && s <= in7;
        });

        return (
          <>
            {activeClosure && (
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-red/8 border border-red/15 mb-4">
                <CalendarOff size={16} className="text-red shrink-0" />
                <div>
                  <p className="text-[13px] font-medium text-red">Restaurant is closed — {activeClosure.name}</p>
                  <p className="text-[11px] text-red/70">No check-in required today.</p>
                </div>
              </div>
            )}
            {!activeClosure && nextClosure && (
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-amber/8 border border-amber/15 mb-4">
                <CalendarOff size={16} className="text-amber shrink-0" />
                <div>
                  <p className="text-[13px] font-medium text-amber">Upcoming closure — {nextClosure.name}</p>
                  <p className="text-[11px] text-amber/70">{fmtDate(nextClosure.startDate)}{nextClosure.startDate !== nextClosure.endDate ? ` – ${fmtDate(nextClosure.endDate)}` : ''}</p>
                </div>
              </div>
            )}
          </>
        );
      })()}

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
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-linear-to-br from-amber-light to-coffee">
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
              onLeave && leaveIsFullDay ? (
                <StatusBadge label={t('dashboard.onLeave', 'On leave')} variant="blue" />
              ) : checkedIn ? (
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
            ) : onLeave && leaveIsFullDay ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue/8 border border-blue/15">
                <CalendarOff size={16} className="text-blue shrink-0" />
                <div>
                  <p className="text-[13px] font-medium text-blue">
                    {t('dashboard.onApprovedLeave', 'You are on approved leave today')}
                  </p>
                  <p className="text-[11px] text-blue/70">
                    {t('dashboard.noCheckinRequired', 'No check-in required.')}
                  </p>
                </div>
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

      {/* Attendance KPI — today */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <GlassCard hover={false}>
          <div className="p-4">
            <p className="text-[11px] text-text-tertiary uppercase tracking-[1px] mb-1">Today</p>
            <p className={cn('text-[24px] font-bold tabular-nums', completed ? 'text-green' : checkedIn ? 'text-blue' : 'text-text-tertiary')}>
              {completed ? 'Done' : checkedIn ? 'In' : '—'}
            </p>
            <p className="text-[11px] text-text-tertiary mt-1">
              {completed ? 'Checked in and out' : checkedIn ? 'Checked in, awaiting checkout' : 'Not checked in yet'}
            </p>
          </div>
        </GlassCard>
        <GlassCard hover={false}>
          <div className="p-4">
            <p className="text-[11px] text-text-tertiary uppercase tracking-[1px] mb-1">Check-in</p>
            <p className="text-[24px] font-bold text-text-primary tabular-nums font-mono">
              {today?.checkInAt || '—'}
            </p>
            <p className="text-[11px] text-text-tertiary mt-1">
              {today?.isLate ? 'Late arrival' : today?.checkInAt ? 'On time' : 'Awaiting'}
            </p>
          </div>
        </GlassCard>
        <GlassCard hover={false}>
          <div className="p-4">
            <p className="text-[11px] text-text-tertiary uppercase tracking-[1px] mb-1">Check-out</p>
            <p className="text-[24px] font-bold text-text-primary tabular-nums font-mono">
              {today?.checkOutAt || '—'}
            </p>
            <p className="text-[11px] text-text-tertiary mt-1">
              {today?.checkOutAt ? 'Recorded' : checkedIn ? 'Pending' : 'Awaiting'}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Upcoming closures */}
      <GlassCard hover={false} className="mb-6">
        <GlassCardHeader title={t('dashboard.upcomingClosures', 'Upcoming closures')} />
        <div className="px-5 py-4">
          {(() => {
            const nowDate = new Date();
            nowDate.setHours(0, 0, 0, 0);
            const upcoming = (closures ?? [])
              .filter((c) => new Date(c.endDate) >= nowDate)
              .sort((a, b) => a.startDate.localeCompare(b.startDate))
              .slice(0, 5);

            if (!closures) {
              return (
                <p className="text-[13px] text-text-tertiary font-sans">
                  {t('common.loading', 'Loading...')}
                </p>
              );
            }

            if (upcoming.length === 0) {
              return (
                <p className="text-[13px] text-text-tertiary font-sans text-center py-2">
                  {t('dashboard.noUpcomingClosures', 'No upcoming closures')}
                </p>
              );
            }

            return (
              <div className="space-y-2">
                {upcoming.map((c) => {
                  const start = new Date(c.startDate);
                  const end = new Date(c.endDate);
                  const isActive = nowDate >= start && nowDate <= end;
                  return (
                    <div key={c.publicId} className="flex items-center gap-3 py-2">
                      <CalendarOff size={14} className={isActive ? 'text-red shrink-0' : 'text-amber shrink-0'} />
                      <div className="flex-1">
                        <p className="text-[13px] text-text-primary font-sans">{c.name}</p>
                        <p className="text-[11px] text-text-tertiary font-sans">
                          {fmtDate(c.startDate)}{c.startDate !== c.endDate ? ` – ${fmtDate(c.endDate)}` : ''}
                        </p>
                      </div>
                      <StatusBadge
                        label={isActive ? t('dashboard.closedNow', 'Closed now') : t('dashboard.upcoming', 'Upcoming')}
                        variant={isActive ? 'red' : 'amber'}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </GlassCard>

      {/* Pending & upcoming leave requests */}
      {(() => {
        const pendingLeaves = (allLeaves ?? [])
          .filter((l) => l.employeePublicId === employee.publicId && (l.status === 'pending' || (l.status === 'approved' && l.endDate >= new Date().toISOString().split('T')[0])))
          .sort((a, b) => a.startDate.localeCompare(b.startDate))
          .slice(0, 5);

        if (pendingLeaves.length === 0) return null;

        return (
          <GlassCard hover={false} className="mb-6">
            <GlassCardHeader title={t('dashboard.upcomingLeaves', 'Upcoming leaves')} />
            <div className="px-5 py-4 space-y-2">
              {pendingLeaves.map((leave) => (
                <div key={leave.publicId} className="flex items-center gap-3 py-2">
                  <CalendarOff size={14} className={leave.status === 'pending' ? 'text-amber shrink-0' : 'text-green shrink-0'} />
                  <div className="flex-1">
                    <p className="text-[13px] text-text-primary font-sans">
                      {fmtDate(leave.startDate)}{leave.startDate !== leave.endDate ? ` – ${fmtDate(leave.endDate)}` : ''}
                      {!leave.isFullDay && leave.startTime && leave.endTime && (
                        <span className="text-[11px] text-text-tertiary ml-1">{leave.startTime}–{leave.endTime}</span>
                      )}
                    </p>
                    {leave.reason && (
                      <p className="text-[11px] text-text-tertiary font-sans truncate max-w-62.5">{leave.reason}</p>
                    )}
                  </div>
                  <StatusBadge
                    label={leave.status === 'pending' ? t('leave.pending', 'Pending') : t('leave.approved', 'Approved')}
                    variant={leave.status === 'pending' ? 'amber' : 'green'}
                  />
                </div>
              ))}
            </div>
          </GlassCard>
        );
      })()}

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
                    className="flex items-center gap-3 px-5 py-2.5 transition-colors duration-120 hover:bg-cream-3/35 cursor-default"
                  >
                    <CalendarDays size={14} className="text-text-tertiary shrink-0" />
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
              <div className="flex items-center gap-3">
                <Link
                  to="/console/leave"
                  className="text-xs text-amber font-medium cursor-pointer no-underline"
                >
                  {t('dashboard.viewAll', 'View all')} &rarr;
                </Link>
              </div>
            }
          />
          <div className="px-5 py-4">
            {employee.workspacePublicId ? (
              <EmployeeLeaveList
                workspacePublicId={employee.workspacePublicId}
                employeePublicId={employee.publicId}
                employeeName={employee.name}
                closures={closures}
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
  employeePublicId,
  employeeName,
  closures,
}: {
  workspacePublicId: string;
  employeePublicId: string;
  employeeName: string;
  closures?: import('@/types').ClosurePeriod[];
}) {
  const { t } = useTranslation();
  const { data: leaves, isLoading } = useLeaveRequests(workspacePublicId);
  const deleteLeave = useDeleteLeaveRequest(workspacePublicId);
  const [showModal, setShowModal] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!confirmCancelId) return;
    try {
      await deleteLeave.mutateAsync(confirmCancelId);
      toast.success(t('leave.cancelSuccess', 'Leave request cancelled'));
    } catch {
      toast.error(t('leave.cancelError', 'Failed to cancel leave request'));
    }
    setConfirmCancelId(null);
  };

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

  const myLeaves = (leaves ?? [])
    .filter((l) => l.employeePublicId === employeePublicId)
    .slice(0, 5);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light transition-colors mb-4"
      >
        <Plus size={14} />
        {t('leave.submitRequest', 'Submit leave request')}
      </button>

      {isLoading ? (
        <p className="text-[13px] text-text-tertiary font-sans">
          {t('common.loading', 'Loading...')}
        </p>
      ) : myLeaves.length === 0 ? (
        <p className="text-[13px] text-text-tertiary font-sans text-center py-2">
          {t('dashboard.noLeaveRequests', 'No leave requests')}
        </p>
      ) : (
        <div className="space-y-2">
          {myLeaves.map((leave) => (
            <div
              key={leave.publicId}
              className="flex items-center gap-3 py-2 transition-colors duration-120"
            >
              <CalendarOff size={14} className="text-text-tertiary shrink-0" />
              <div className="flex-1">
                <p className="text-[13px] text-text-primary font-sans">
                  {formatDate(leave.startDate)}
                  {leave.startDate !== leave.endDate && ` \u2013 ${formatDate(leave.endDate)}`}
                  {!leave.isFullDay && leave.startTime && leave.endTime && (
                    <span className="text-[11px] text-text-tertiary ml-1">
                      {leave.startTime}–{leave.endTime}
                    </span>
                  )}
                </p>
                {leave.reason && (
                  <p className="text-[11px] text-text-tertiary font-sans truncate max-w-50">
                    {leave.reason}
                  </p>
                )}
              </div>
              <StatusBadge label={statusLabel(leave.status)} variant={statusVariant(leave.status)} />
              {leave.status === 'pending' && (
                <button
                  onClick={() => setConfirmCancelId(leave.publicId)}
                  className="w-6 h-6 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-tertiary hover:bg-red/10 hover:text-red transition-colors"
                  title={t('leave.cancel', 'Cancel')}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <LeaveRequestModal
        open={showModal}
        onOpenChange={setShowModal}
        workspacePublicId={workspacePublicId}
        employeePublicId={employeePublicId}
        closures={closures}
      />

      <ConfirmModal
        open={confirmCancelId !== null}
        onOpenChange={(open) => { if (!open) setConfirmCancelId(null); }}
        title={t('leave.cancelTitle', 'Cancel leave request')}
        description={t('leave.cancelDescription', 'Are you sure you want to cancel this leave request? This action cannot be undone.')}
        confirmLabel={t('leave.cancelConfirm', 'Yes, cancel')}
        variant="danger"
        loading={deleteLeave.isPending}
        onConfirm={handleCancel}
      />
    </>
  );
}
