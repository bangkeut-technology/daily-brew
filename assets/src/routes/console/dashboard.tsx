import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getWorkspacePublicId, setWorkspacePublicId } from '@/lib/auth';
import { useRoleContext, useLinkEmployee } from '@/hooks/queries/useRoleContext';
import { useCreateWorkspace } from '@/hooks/queries/useWorkspaces';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { Building2, UserCheck, Coffee } from 'lucide-react';
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

function NoWorkspaceView() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<null | 'owner' | 'employee'>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const createWorkspace = useCreateWorkspace();
  const linkEmployee = useLinkEmployee();

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = workspaceName.trim();
    if (!name) return;
    try {
      const ws = await createWorkspace.mutateAsync(name);
      setWorkspacePublicId(ws.publicId);
      window.location.reload();
    } catch {
      toast.error(t('workspace.createFailed', 'Failed to create workspace'));
    }
  };

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

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Coffee size={40} className="text-coffee/60 mx-auto mb-4" strokeWidth={1.5} />
          <h2
            className="text-[20px] font-semibold text-text-primary mb-2"
            style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif" }}
          >
            {t('dashboard.getStarted', 'Get started with DailyBrew')}
          </h2>
          <p className="text-[13.5px] text-text-secondary">
            {t('dashboard.chooseRole', 'Choose how you want to use DailyBrew.')}
          </p>
        </div>

        {!mode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Owner option */}
            <button
              type="button"
              onClick={() => setMode('owner')}
              className="group bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Building2 size={22} className="text-amber" />
              </div>
              <p className="text-[14px] font-semibold text-text-primary mb-1">
                {t('dashboard.becomeOwner', 'I own a restaurant')}
              </p>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                {t('dashboard.becomeOwnerDesc', 'Create a workspace to manage your staff, shifts, and attendance.')}
              </p>
            </button>

            {/* Employee option */}
            <button
              type="button"
              onClick={() => setMode('employee')}
              className="group bg-glass-bg backdrop-blur-md border border-glass-border rounded-2xl p-6 text-left cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-blue/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <UserCheck size={22} className="text-blue" />
              </div>
              <p className="text-[14px] font-semibold text-text-primary mb-1">
                {t('dashboard.linkEmployee', "I'm a staff member")}
              </p>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                {t('dashboard.linkEmployeeDesc', 'Enter the employee ID your employer gave you to link your account.')}
              </p>
            </button>
          </div>
        )}

        {/* Owner form */}
        {mode === 'owner' && (
          <GlassCard hover={false}>
            <form onSubmit={handleCreateWorkspace} className="p-6">
              <p className="text-[14px] font-semibold text-text-primary mb-1">
                {t('dashboard.createWorkspace', 'Create your workspace')}
              </p>
              <p className="text-[12.5px] text-text-secondary mb-5">
                {t('dashboard.createWorkspaceDesc', 'Enter your restaurant name to get started.')}
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder={t('workspace.newPlaceholder', 'Restaurant name')}
                  autoFocus
                  className="flex-1 px-3 py-2.5 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={createWorkspace.isPending || !workspaceName.trim()}
                  className="px-5 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all hover:bg-coffee-light disabled:opacity-50"
                >
                  {t('common.create')}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setMode(null)}
                className="mt-4 text-[12px] text-text-tertiary bg-transparent border-none cursor-pointer hover:text-text-secondary transition-colors"
              >
                &larr; {t('common.back')}
              </button>
            </form>
          </GlassCard>
        )}

        {/* Employee form */}
        {mode === 'employee' && (
          <GlassCard hover={false}>
            <form onSubmit={handleLinkEmployee} className="p-6">
              <p className="text-[14px] font-semibold text-text-primary mb-1">
                {t('dashboard.linkToEmployee', 'Link to your employee profile')}
              </p>
              <p className="text-[12.5px] text-text-secondary mb-5">
                {t('dashboard.linkToEmployeeDesc', 'Ask your employer for your employee public ID and enter it below.')}
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder={t('onboarding.employeePublicId', 'Employee public ID')}
                  autoFocus
                  className="flex-1 px-3 py-2.5 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all font-mono"
                />
                <button
                  type="submit"
                  disabled={linkEmployee.isPending || !employeeId.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all hover:bg-coffee-light disabled:opacity-50"
                >
                  <UserCheck size={14} />
                  {t('profile.link', 'Link')}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setMode(null)}
                className="mt-4 text-[12px] text-text-tertiary bg-transparent border-none cursor-pointer hover:text-text-secondary transition-colors"
              >
                &larr; {t('common.back')}
              </button>
            </form>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
