import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { getWorkspacePublicId } from '@/lib/auth';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';

export const Route = createFileRoute('/console/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useTranslation();
  const workspaceId = getWorkspacePublicId() || '';
  const { data: roleContext, isLoading: roleLoading } = useRoleContext();

  if (!workspaceId) {
    return (
      <div className="page-enter">
        <PageHeader title={t('nav.dashboard')} />
        <div className="bg-white/60 backdrop-blur-md border border-white/85 rounded-2xl p-8 text-center">
          <p className="text-text-secondary mb-4">
            No workspace selected. Create one or link to an employee to get started.
          </p>
          <Link
            to="/console/settings"
            className="px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white no-underline hover:bg-coffee-light transition-colors"
          >
            Go to settings
          </Link>
        </div>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="page-enter">
        <PageHeader title={t('nav.dashboard')} />
        <p className="text-text-tertiary">{t('common.loading')}</p>
      </div>
    );
  }

  // Employee dashboard if user is an employee (not an owner) in this workspace
  if (roleContext?.isEmployee && !roleContext?.isOwner) {
    return <EmployeeDashboard />;
  }

  // Owner dashboard (default, also for users who are both)
  return <OwnerDashboard />;
}
