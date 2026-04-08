import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getWorkspacePublicId } from '@/lib/auth';
import { useRoleContext, useLinkEmployee } from '@/hooks/queries/useRoleContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { UserCheck, Coffee } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/console/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || '';
  const { data: roleContext, isLoading: roleLoading } = useRoleContext();

  if (!workspaceId) {
    return <NoWorkspaceView />;
  }

  if (roleLoading || !roleContext) {
    return (
      <div className="page-enter">
        <PageHeader title={t('nav.dashboard')} />
        <p className="text-text-tertiary">{t('common.loading')}</p>
      </div>
    );
  }

  // Managers see the owner dashboard (attendance overview, leave approvals)
  // Regular employees see the employee dashboard (own data only)
  if (roleContext.isEmployee && !roleContext.isOwner && !roleContext.isManager) {
    return <EmployeeDashboard key="employee" />;
  }

  // Owner and manager dashboard
  return <OwnerDashboard key="owner" />;
}

function NoWorkspaceView() {
  const { t } = useTranslation();
  const [employeeId, setEmployeeId] = useState('');
  const linkEmployee = useLinkEmployee();

  const handleLinkEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = employeeId.trim();
    if (!id) return;
    try {
      await linkEmployee.mutateAsync(id);
      toast.success(t('profile.employeeLinked', 'Employee linked successfully'));
      window.location.reload();
    } catch {
      toast.error(t('profile.employeeLinkError', 'Failed to link. Check the ID and try again.'));
    }
  };

  return (
    <div className="page-enter">
      <PageHeader title={t('nav.dashboard')} />

      <div>
        {/* Header */}
        <div className="text-center mb-8">
          <Coffee size={40} className="text-coffee/60 mx-auto mb-4" strokeWidth={1.5} />
          <h2
            className="text-[22px] font-semibold text-text-primary mb-2"
            style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif" }}
          >
            {t('dashboard.getStarted', 'Get started with DailyBrew')}
          </h2>
          <p className="text-[15.5px] text-text-secondary">
            {t('dashboard.linkToEmployeeDesc', 'Ask your employer for your employee public ID and enter it below.')}
          </p>
        </div>

        <GlassCard hover={false}>
          <form onSubmit={handleLinkEmployee} className="p-6">
            <p className="text-[16px] font-semibold text-text-primary mb-1">
              {t('dashboard.linkToEmployee', 'Link to your employee profile')}
            </p>
            <p className="text-[14.5px] text-text-secondary mb-5">
              {t('dashboard.linkToEmployeeHint', 'Enter the employee ID your employer gave you to connect your account.')}
            </p>
            <div className="flex gap-3">
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder={t('onboarding.employeePublicId', 'Employee public ID')}
                autoFocus
                className="flex-1 px-3 py-2.5 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all font-mono"
              />
              <button
                type="submit"
                disabled={linkEmployee.isPending || !employeeId.trim()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer transition-all hover:bg-coffee-light disabled:opacity-50"
              >
                <UserCheck size={14} />
                {t('profile.link', 'Link')}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
