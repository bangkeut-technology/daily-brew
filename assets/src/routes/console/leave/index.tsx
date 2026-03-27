import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useLeaveRequests, useUpdateLeaveRequest } from '@/hooks/queries/useLeaveRequests';
import { getWorkspacePublicId } from '@/lib/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';

export const Route = createFileRoute('/console/leave/')({
  component: LeaveRequestsPage,
});

function LeaveRequestsPage() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || '';
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: requests, isLoading } = useLeaveRequests(workspaceId, statusFilter || undefined);
  const updateLeave = useUpdateLeaveRequest(workspaceId);

  const handleAction = async (publicId: string, status: string) => {
    try {
      await updateLeave.mutateAsync({ publicId, status });
      toast.success(`Leave request ${status}`);
    } catch {
      toast.error('Failed to update leave request');
    }
  };

  const statusVariant = (s: string) => {
    if (s === 'approved') return 'green';
    if (s === 'rejected') return 'red';
    return 'amber';
  };

  return (
    <div className="page-enter">
      <PageHeader title={t('nav.leaveRequests')} />

      <div className="flex gap-2 mb-4">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-colors ${
              statusFilter === s
                ? 'bg-coffee text-white'
                : 'bg-white/62 text-text-secondary hover:bg-cream-3'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-text-tertiary">{t('common.loading')}</p>
      ) : (
        <GlassCard hover={false}>
          {requests?.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-text-tertiary">
              {t('common.noResults')}
            </p>
          ) : (
            requests?.map((lr, i) => (
              <div
                key={lr.publicId}
                className="flex items-center gap-3 px-5 py-3 border-b border-cream-3/50 last:border-0"
              >
                <Avatar name={lr.employeeName} index={i} size={32} />
                <div className="flex-1">
                  <div className="text-[13.5px] font-medium text-text-primary">
                    {lr.employeeName}
                  </div>
                  <div className="text-[11px] text-text-tertiary">
                    {lr.date} {lr.reason ? `\u2014 ${lr.reason}` : ''}
                  </div>
                </div>
                <StatusBadge label={lr.status} variant={statusVariant(lr.status)} />
                {lr.status === 'pending' && (
                  <div className="flex gap-1.5 ml-2">
                    <button
                      onClick={() => handleAction(lr.publicId, 'approved')}
                      className="text-[11.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer bg-[#4A7C59]/12 text-[#4A7C59] transition-colors hover:bg-[#4A7C59]/20"
                    >
                      &#10003; {t('leave.approve')}
                    </button>
                    <button
                      onClick={() => handleAction(lr.publicId, 'rejected')}
                      className="text-[11.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer bg-[#C0392B]/10 text-[#C0392B] transition-colors hover:bg-[#C0392B]/18"
                    >
                      &#10005; {t('leave.reject')}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </GlassCard>
      )}
    </div>
  );
}
