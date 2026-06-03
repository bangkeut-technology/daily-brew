import { createLazyFileRoute } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getWorkspacePublicId, setWorkspacePublicId } from '@/lib/auth';
import { useRoleContext, useLinkEmployee } from '@/hooks/queries/useRoleContext';
import { useCreateWorkspace } from '@/hooks/queries/useWorkspaces';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { QrScanner } from '@/components/shared/QrScanner';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { Building2, UserCheck, Coffee, QrCode, KeyRound, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Personal employee QR codes are encoded as `dailybrew:emp:{publicId}` —
 * mirrors the workspace `dailybrew:ws:{token}` / sub-QR `dailybrew:wqr:{token}`
 * convention. Strip the prefix to get the bare ID we send to the link API.
 */
const EMPLOYEE_QR_PREFIX = 'dailybrew:emp:';

export const Route = createLazyFileRoute('/console/dashboard')({
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
  const [mode, setMode] = useState<null | 'owner' | 'employee'>(null);
  const [linkMode, setLinkMode] = useState<'scan' | 'paste'>('scan');
  const [workspaceName, setWorkspaceName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanKey, setScanKey] = useState(0);
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

  const linkById = useCallback(
    async (id: string) => {
      try {
        await linkEmployee.mutateAsync(id);
        toast.success(t('profile.employeeLinked', 'Employee linked successfully'));
        window.location.reload();
      } catch {
        toast.error(t('profile.employeeLinkError', 'Failed to link. Check the ID and try again.'));
      }
    },
    [linkEmployee, t],
  );

  const handleLinkEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = employeeId.trim();
    if (!id) return;
    await linkById(id);
  };

  const handleScanDecode = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text.startsWith(EMPLOYEE_QR_PREFIX)) {
        // Tell the user the scan landed on the wrong kind of code and let
        // them try again — rotating scanKey unmounts/remounts QrScanner,
        // which is the cleanest way to release + restart the camera + jsQR
        // decode latch without keeping internal "have we already decoded"
        // state on the parent.
        setScanError(
          t('dashboard.linkInvalidQr', "That QR isn't a DailyBrew employee code. Try again."),
        );
        setScanKey((k) => k + 1);
        return;
      }
      setScanError(null);
      await linkById(text.slice(EMPLOYEE_QR_PREFIX.length));
    },
    [linkById, t],
  );

  return (
    <div className="page-enter">
      <PageHeader
        title={t('nav.dashboard')}
        help={{ href: '/guides/owner', label: 'Open the owner setup guide' }}
      />

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
              <p className="text-[16px] font-semibold text-text-primary mb-1">
                {t('dashboard.becomeOwner', 'I own a restaurant')}
              </p>
              <p className="text-[14px] text-text-secondary leading-relaxed">
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
              <p className="text-[16px] font-semibold text-text-primary mb-1">
                {t('dashboard.linkEmployee', "I'm a staff member")}
              </p>
              <p className="text-[14px] text-text-secondary leading-relaxed">
                {t('dashboard.linkEmployeeDesc', 'Enter the employee ID your employer gave you to link your account.')}
              </p>
            </button>
          </div>
        )}

        {/* Owner form */}
        {mode === 'owner' && (
          <GlassCard hover={false}>
            <form onSubmit={handleCreateWorkspace} className="p-6">
              <p className="text-[16px] font-semibold text-text-primary mb-1">
                {t('dashboard.createWorkspace', 'Create your workspace')}
              </p>
              <p className="text-[14.5px] text-text-secondary mb-5">
                {t('dashboard.createWorkspaceDesc', 'Enter your restaurant name to get started.')}
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder={t('workspace.newPlaceholder', 'Restaurant name')}
                  autoFocus
                  className="flex-1 px-3 py-2.5 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={createWorkspace.isPending || !workspaceName.trim()}
                  className="px-5 py-2 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer transition-all hover:bg-coffee-light disabled:opacity-50"
                >
                  {t('common.create')}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setMode(null)}
                className="mt-4 text-[14px] text-text-tertiary bg-transparent border-none cursor-pointer hover:text-text-secondary transition-colors"
              >
                &larr; {t('common.back')}
              </button>
            </form>
          </GlassCard>
        )}

        {/* Employee form — Scan QR (default) or Paste ID, plus a help disclosure */}
        {mode === 'employee' && (
          <GlassCard hover={false}>
            <div className="p-6">
              <p className="text-[16px] font-semibold text-text-primary mb-1">
                {t('dashboard.linkToEmployee', 'Link to your employee profile')}
              </p>
              <p className="text-[14.5px] text-text-secondary mb-5">
                {t(
                  'dashboard.linkToEmployeeDesc2',
                  "Scan the QR your employer is showing you, or paste your public ID. Either one links you to your employee profile.",
                )}
              </p>

              {/* Segmented tab control — Scan QR is the default since most
                  employees are guided by their employer holding a screen up
                  to them. Paste ID is the fallback for shared text. */}
              <div
                role="tablist"
                className="flex gap-1 p-1 rounded-lg bg-cream-3/40 mb-5"
              >
                {(['scan', 'paste'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="tab"
                    aria-selected={linkMode === m}
                    onClick={() => {
                      setLinkMode(m);
                      setScanError(null);
                    }}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[14px] font-medium border-none cursor-pointer transition-all',
                      linkMode === m
                        ? 'bg-glass-bg text-text-primary shadow-sm'
                        : 'bg-transparent text-text-tertiary hover:text-text-secondary',
                    )}
                  >
                    {m === 'scan' ? <QrCode size={14} /> : <KeyRound size={14} />}
                    {m === 'scan'
                      ? t('dashboard.linkScanTab', 'Scan QR')
                      : t('dashboard.linkPasteTab', 'Paste ID')}
                  </button>
                ))}
              </div>

              {linkMode === 'scan' ? (
                <div className="space-y-3">
                  <QrScanner key={scanKey} onDecode={handleScanDecode} />
                  <p className="text-[13.5px] text-text-tertiary text-center">
                    {t(
                      'dashboard.linkScanHint',
                      'Aim at the QR code your employer is showing you.',
                    )}
                  </p>
                  {scanError && (
                    <div className="px-3 py-2 rounded-lg bg-red/8 border border-red/15 text-[13.5px] text-red">
                      {scanError}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleLinkEmployee}>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      id="employee-id"
                      name="employeeId"
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
              )}

              {/* Help disclosure — uses <details> so we get
                  open/close + keyboard a11y for free without an extra state. */}
              <details className="mt-5 group">
                <summary className="flex items-center gap-1.5 text-[13.5px] font-medium text-text-secondary cursor-pointer list-none hover:text-coffee transition-colors">
                  <HelpCircle size={14} />
                  {t('dashboard.linkHelpTitle', 'Where do I find my ID?')}
                </summary>
                <p className="mt-2 pl-5 text-[13.5px] text-text-tertiary leading-relaxed">
                  {t(
                    'dashboard.linkHelpBody',
                    "Ask your employer to open DailyBrew → Employees → your name → Share. They'll see a QR you can scan, plus the ID you can paste here.",
                  )}
                </p>
              </details>

              <button
                type="button"
                onClick={() => setMode(null)}
                className="mt-5 text-[14px] text-text-tertiary bg-transparent border-none cursor-pointer hover:text-text-secondary transition-colors"
              >
                &larr; {t('common.back')}
              </button>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
