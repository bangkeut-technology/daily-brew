import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Crown, Inbox, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLeaveRequests, useUpdateLeaveRequest, useDeleteLeaveRequest } from '@/hooks/queries/useLeaveRequests';
import { useEmployees } from '@/hooks/queries/useEmployees';
import { useClosures } from '@/hooks/queries/useClosures';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { usePlan } from '@/hooks/queries/usePlan';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { UpgradeModal } from '@/components/shared/UpgradeModal';
import { LeaveRequestModal } from '@/components/shared/LeaveRequestModal';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useDateFormat } from '@/hooks/useDateFormat';

export const Route = createFileRoute('/console/leave/')({
  component: LeaveRequestsPage,
});

type StatusFilter = '' | 'pending' | 'approved' | 'rejected';

const FILTER_TABS: { value: StatusFilter; labelKey: string; fallback: string }[] = [
  { value: '', labelKey: 'leave.all', fallback: 'All' },
  { value: 'pending', labelKey: 'leave.pending', fallback: 'Pending' },
  { value: 'approved', labelKey: 'leave.approved', fallback: 'Approved' },
  { value: 'rejected', labelKey: 'leave.rejected', fallback: 'Rejected' },
];

function LeaveRequestsPage() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || '';
  const { data: plan, isLoading: planLoading } = usePlan(workspaceId);
  const { data: roleContext, isLoading: roleLoading } = useRoleContext();
  const canUse = plan?.canUseLeaveRequests ?? false;
  const isManager = roleContext?.isManager ?? false;
  const isOwner = roleContext?.isOwner ?? false;
  const isEmployee = !!roleContext && roleContext.isEmployee && !isOwner && !isManager;
  const canManage = isOwner || isManager;
  const employee = roleContext?.employee ?? null;
  const { data: employees } = useEmployees(canManage ? workspaceId : '');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [showUpgrade, setShowUpgrade] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const { data: requests, isLoading } = useLeaveRequests(canUse ? workspaceId : '', statusFilter || undefined);
  const { data: closures } = useClosures(workspaceId);
  const updateLeave = useUpdateLeaveRequest(workspaceId);
  const deleteLeave = useDeleteLeaveRequest(workspaceId);
  const fmtDate = useDateFormat();
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  if (planLoading || roleLoading) {
    return (
      <div className="page-enter">
        <PageHeader title={t('nav.leaveRequests')} />
        <p className="text-text-tertiary">{t('common.loading')}</p>
      </div>
    );
  }

  if (plan && !plan.canUseLeaveRequests) {
    return (
      <div className="page-enter">
        <PageHeader title={t('nav.leaveRequests')} />
        <GlassCard hover={false}>
          <div className="p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber/10 mb-2">
              <Crown size={28} className="text-amber" />
            </div>
            <h2 className="text-[20px] font-semibold text-text-primary font-serif">
              {t('upgrade.leaveRequests.title')}
            </h2>
            <p className="text-[15px] text-text-secondary leading-relaxed">
              {t('upgrade.leaveRequests.description')}
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="px-6 py-2.5 rounded-xl text-[16px] font-medium text-white border-none cursor-pointer btn-shimmer transition-all hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(107,66,38,0.30)]"
            >
              {t('upgrade.upgradeButton')}
            </button>
          </div>
        </GlassCard>
        <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} feature="leaveRequests" />
      </div>
    );
  }

  const handleAction = async (publicId: string, status: 'approved' | 'rejected') => {
    try {
      await updateLeave.mutateAsync({ publicId, status });
      toast.success(
        t(`leave.${status}Success`, `Leave request ${status}`),
      );
    } catch {
      toast.error(t('leave.updateError', 'Failed to update leave request'));
    }
  };

  const handleCancelLeave = async () => {
    if (!confirmCancelId) return;
    try {
      await deleteLeave.mutateAsync(confirmCancelId);
      toast.success(t('leave.cancelSuccess', 'Leave request cancelled'));
    } catch {
      toast.error(t('leave.cancelError', 'Failed to cancel leave request'));
    }
    setConfirmCancelId(null);
  };

  const statusVariant = (s: string): 'green' | 'amber' | 'red' => {
    if (s === 'approved') return 'green';
    if (s === 'rejected') return 'red';
    return 'amber';
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    if (startDate === endDate) return fmtDate(startDate);
    return `${fmtDate(startDate)} - ${fmtDate(endDate)}`;
  };


  // Filter to only this employee's requests if employee view
  const filteredRequests = isEmployee && employee
    ? (requests ?? []).filter((r) => r.employeePublicId === employee.publicId)
    : requests;

  return (
    <div className="page-enter">
      <PageHeader
        title={isEmployee ? t('nav.myLeaveRequests', 'My leave requests') : t('nav.leaveRequests')}
      />

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[15px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light transition-colors"
        >
          <Plus size={14} />
          {t('leave.submitRequest', 'Submit leave request')}
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[14px] font-medium border-none cursor-pointer transition-colors',
              statusFilter === tab.value
                ? 'bg-coffee text-white'
                : 'bg-glass-bg text-text-secondary hover:bg-cream-3',
            )}
          >
            {t(tab.labelKey, tab.fallback)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[15px] text-text-tertiary">{t('common.loading')}</p>
        </div>
      ) : filteredRequests?.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-cream-3 rounded-2xl bg-glass-bg backdrop-blur-md flex flex-col items-center justify-center min-h-[200px]">
          <Inbox size={28} className="text-text-tertiary mb-2" />
          <span className="text-[15px] text-text-tertiary">
            {t('leave.noRequests', 'No leave requests found')}
          </span>
        </div>
      ) : (
        <GlassCard hover={false}>
          <GlassCardHeader
            title={isEmployee ? t('leave.myRequests', 'My requests') : t('leave.requests', 'Leave requests')}
            action={
              <span className="text-[14px] text-text-tertiary">
                {filteredRequests?.length} {t('leave.total', 'total')}
              </span>
            }
          />
          <div>
            {filteredRequests?.map((lr, i) => (
              <div
                key={lr.publicId}
                className="flex items-center gap-3 px-5 py-3 border-b border-cream-3/50 last:border-0 transition-colors hover:bg-cream-3/20"
              >
                {!isEmployee && <Avatar name={lr.employeeName} index={i} size={32} />}
                <div className="flex-1 min-w-0">
                  {!isEmployee && (
                    <div className="text-[15.5px] font-medium text-text-primary truncate">
                      {lr.employeeName}
                    </div>
                  )}
                  <div className={isEmployee ? 'text-[15.5px] font-medium text-text-primary' : 'text-[13px] text-text-tertiary'}>
                    {formatDateRange(lr.startDate, lr.endDate)}
                    {!lr.isFullDay && lr.startTime && lr.endTime && ` ${lr.startTime}–${lr.endTime}`}
                  </div>
                  {lr.reason && (
                    <div className="text-[13.5px] text-text-secondary mt-0.5 truncate">
                      {lr.reason}
                    </div>
                  )}
                </div>
                <StatusBadge label={t(`leave.${lr.status}`, lr.status)} variant={statusVariant(lr.status)} />
                {isEmployee && lr.status === 'pending' && (
                  <button
                    onClick={() => setConfirmCancelId(lr.publicId)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-transparent border-none cursor-pointer text-text-tertiary hover:bg-red/10 hover:text-red transition-colors"
                    title={t('leave.cancel', 'Cancel')}
                  >
                    <X size={14} />
                  </button>
                )}
                {!isEmployee && lr.status === 'pending' && (
                  <div className="flex gap-1.5 ml-2">
                    <button
                      onClick={() => handleAction(lr.publicId, 'approved')}
                      disabled={updateLeave.isPending}
                      className="text-[13.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer bg-green/12 text-green transition-colors hover:bg-green/20 disabled:opacity-50"
                    >
                      &#10003; {t('leave.approve', 'Approve')}
                    </button>
                    <button
                      onClick={() => handleAction(lr.publicId, 'rejected')}
                      disabled={updateLeave.isPending}
                      className="text-[13.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer bg-red/10 text-red transition-colors hover:bg-red/18 disabled:opacity-50"
                    >
                      &#10005; {t('leave.reject', 'Reject')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {canManage ? (
        <LeaveRequestModal
          open={showSubmitModal}
          onOpenChange={setShowSubmitModal}
          workspacePublicId={workspaceId}
          employeePublicId={employee?.publicId}
          employees={(employees ?? []).filter((e) => e.active).map((e) => ({ publicId: e.publicId, name: e.name }))}
          closures={closures}
        />
      ) : employee ? (
        <LeaveRequestModal
          open={showSubmitModal}
          onOpenChange={setShowSubmitModal}
          workspacePublicId={workspaceId}
          employeePublicId={employee.publicId}
          closures={closures}
        />
      ) : null}

      <ConfirmModal
        open={confirmCancelId !== null}
        onOpenChange={(open) => { if (!open) setConfirmCancelId(null); }}
        title={t('leave.cancelTitle', 'Cancel leave request')}
        description={t('leave.cancelDescription', 'Are you sure you want to cancel this leave request? This action cannot be undone.')}
        confirmLabel={t('leave.cancelConfirm', 'Yes, cancel')}
        variant="danger"
        loading={deleteLeave.isPending}
        onConfirm={handleCancelLeave}
      />
    </div>
  );
}
