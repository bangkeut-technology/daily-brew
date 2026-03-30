import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Crown, Inbox } from 'lucide-react';
import { useLeaveRequests, useUpdateLeaveRequest } from '@/hooks/queries/useLeaveRequests';
import { usePlan } from '@/hooks/queries/usePlan';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { UpgradeModal } from '@/components/shared/UpgradeModal';

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
  const { data: plan } = usePlan(workspaceId);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('');
  const [showUpgrade, setShowUpgrade] = useState(true);
  const { data: requests, isLoading } = useLeaveRequests(workspaceId, statusFilter || undefined);
  const updateLeave = useUpdateLeaveRequest(workspaceId);

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
    if (startDate === endDate) return startDate;
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="page-enter">
      <PageHeader title={t('nav.leaveRequests')} />

      <div className="flex gap-2 mb-6">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-colors ${
              statusFilter === tab.value
                ? 'bg-coffee text-white'
                : 'bg-glass-bg text-text-secondary hover:bg-cream-3'
            }`}
          >
            {t(tab.labelKey, tab.fallback)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-[13px] text-text-tertiary">{t('common.loading')}</p>
        </div>
      ) : requests?.length === 0 ? (
        <div className="border-[1.5px] border-dashed border-cream-3 rounded-2xl bg-glass-bg backdrop-blur-md flex flex-col items-center justify-center min-h-[200px]">
          <Inbox size={28} className="text-text-tertiary mb-2" />
          <span className="text-[13px] text-text-tertiary">
            {t('leave.noRequests', 'No leave requests found')}
          </span>
        </div>
      ) : (
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t('leave.requests', 'Leave requests')}
            action={
              <span className="text-[12px] text-text-tertiary">
                {requests?.length} {t('leave.total', 'total')}
              </span>
            }
          />
          <div>
            {requests?.map((lr, i) => (
              <div
                key={lr.publicId}
                className="flex items-center gap-3 px-5 py-3 border-b border-cream-3/50 last:border-0 transition-colors hover:bg-cream-3/20"
              >
                <Avatar name={lr.employeeName} index={i} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-text-primary truncate">
                    {lr.employeeName}
                  </div>
                  <div className="text-[11px] text-text-tertiary">
                    {formatDateRange(lr.startDate, lr.endDate)}
                    {lr.reason ? ` \u2014 ${lr.reason}` : ''}
                  </div>
                </div>
                <StatusBadge label={t(`leave.${lr.status}`, lr.status)} variant={statusVariant(lr.status)} />
                {lr.status === 'pending' && (
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
    </div>
  );
}
