import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Crown, Inbox, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLeaveRequests, useUpdateLeaveRequest, useCreateLeaveRequest } from '@/hooks/queries/useLeaveRequests';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { usePlan } from '@/hooks/queries/usePlan';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { UpgradeModal } from '@/components/shared/UpgradeModal';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
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
  const isEmployee = !!roleContext && roleContext.isEmployee && !roleContext.isOwner;
  const employee = roleContext?.employee ?? null;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [showUpgrade, setShowUpgrade] = useState(true);
  const { data: requests, isLoading } = useLeaveRequests(canUse ? workspaceId : '', statusFilter || undefined);
  const updateLeave = useUpdateLeaveRequest(workspaceId);
  const createLeave = useCreateLeaveRequest(workspaceId);
  const fmtDate = useDateFormat();

  // Leave request submission form state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmitLeave = async () => {
    if (!startDate || !endDate || !employee?.publicId) return;
    try {
      await createLeave.mutateAsync({
        employeePublicId: employee.publicId,
        startDate,
        endDate,
        reason: reason.trim(),
      });
      toast.success(t('leave.submitSuccess', 'Leave request submitted'));
      setShowSubmitModal(false);
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch {
      toast.error(t('leave.submitError', 'Failed to submit leave request'));
    }
  };

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
            <h2 className="text-[18px] font-semibold text-text-primary font-serif">
              {t('upgrade.leaveRequests.title')}
            </h2>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              {t('upgrade.leaveRequests.description')}
            </p>
            <button
              onClick={() => setShowUpgrade(true)}
              className="px-6 py-2.5 rounded-xl text-[14px] font-medium text-white border-none cursor-pointer btn-shimmer transition-all hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(107,66,38,0.30)]"
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

  const statusVariant = (s: string): 'green' | 'amber' | 'red' => {
    if (s === 'approved') return 'green';
    if (s === 'rejected') return 'red';
    return 'amber';
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    if (startDate === endDate) return fmtDate(startDate);
    return `${fmtDate(startDate)} - ${fmtDate(endDate)}`;
  };

  const submitModal = (
    <Dialog.Root open={showSubmitModal} onOpenChange={setShowSubmitModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] bg-glass-bg backdrop-blur-xl border border-glass-border rounded-2xl shadow-[0_16px_50px_rgba(107,66,38,0.15)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          <div className="p-6 space-y-4">
            <Dialog.Title className="text-[16px] font-semibold text-text-primary font-serif">
              {t('leave.submitRequest', 'Submit leave request')}
            </Dialog.Title>
            <Dialog.Description className="text-[12.5px] text-text-secondary leading-relaxed -mt-2">
              {t('leave.submitDescription', 'Select the dates you need off and optionally add a reason.')}
            </Dialog.Description>

            <div>
              <label htmlFor="leave-start" className="block text-[11px] font-medium text-text-secondary mb-1">
                {t('leave.startDate', 'Start date')}
              </label>
              <CustomDatePicker
                value={startDate}
                onChange={(v) => {
                  setStartDate(v);
                  if (!endDate || v > endDate) setEndDate(v);
                }}
              />
            </div>
            <div>
              <label htmlFor="leave-end" className="block text-[11px] font-medium text-text-secondary mb-1">
                {t('leave.endDate', 'End date')}
              </label>
              <CustomDatePicker
                value={endDate}
                onChange={setEndDate}
              />
            </div>
            <div>
              <label htmlFor="leave-reason-page" className="block text-[11px] font-medium text-text-secondary mb-1">
                {t('leave.reason', 'Reason')}
              </label>
              <textarea
                id="leave-reason-page"
                name="leaveReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={t('leave.reasonPlaceholder', 'e.g. Family event, medical appointment...')}
                className="w-full px-3 py-2 rounded-lg text-[13px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee font-sans resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium bg-transparent text-text-secondary border border-cream-3 cursor-pointer hover:bg-cream-3 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmitLeave}
                disabled={!startDate || !endDate || !reason.trim() || createLeave.isPending}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-white bg-coffee border-none cursor-pointer hover:bg-coffee-light transition-colors disabled:opacity-50"
              >
                {createLeave.isPending ? t('common.loading', 'Loading...') : t('common.submit', 'Submit')}
              </button>
            </div>
          </div>
          <Dialog.Close className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center bg-transparent border-none text-text-tertiary hover:text-text-secondary hover:bg-cream-3/40 cursor-pointer transition-all">
            <X size={15} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );

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
        {isEmployee && employee && (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium bg-coffee text-white border-none cursor-pointer hover:bg-coffee-light transition-colors"
          >
            <Plus size={14} />
            {t('leave.submitRequest', 'Submit leave request')}
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-colors',
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
          <p className="text-[13px] text-text-tertiary">{t('common.loading')}</p>
        </div>
      ) : filteredRequests?.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-cream-3 rounded-2xl bg-glass-bg backdrop-blur-md flex flex-col items-center justify-center min-h-[200px]">
          <Inbox size={28} className="text-text-tertiary mb-2" />
          <span className="text-[13px] text-text-tertiary">
            {t('leave.noRequests', 'No leave requests found')}
          </span>
        </div>
      ) : (
        <GlassCard hover={false}>
          <GlassCardHeader
            title={isEmployee ? t('leave.myRequests', 'My requests') : t('leave.requests', 'Leave requests')}
            action={
              <span className="text-[12px] text-text-tertiary">
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
                    <div className="text-[13.5px] font-medium text-text-primary truncate">
                      {lr.employeeName}
                    </div>
                  )}
                  <div className="text-[11px] text-text-tertiary">
                    {formatDateRange(lr.startDate, lr.endDate)}
                    {lr.reason ? ` \u2014 ${lr.reason}` : ''}
                  </div>
                </div>
                <StatusBadge label={t(`leave.${lr.status}`, lr.status)} variant={statusVariant(lr.status)} />
                {!isEmployee && lr.status === 'pending' && (
                  <div className="flex gap-1.5 ml-2">
                    <button
                      onClick={() => handleAction(lr.publicId, 'approved')}
                      disabled={updateLeave.isPending}
                      className="text-[11.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer bg-green/12 text-green transition-colors hover:bg-green/20 disabled:opacity-50"
                    >
                      &#10003; {t('leave.approve', 'Approve')}
                    </button>
                    <button
                      onClick={() => handleAction(lr.publicId, 'rejected')}
                      disabled={updateLeave.isPending}
                      className="text-[11.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer bg-red/10 text-red transition-colors hover:bg-red/18 disabled:opacity-50"
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

      {submitModal}
    </div>
  );
}
