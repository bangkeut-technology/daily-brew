import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Coffee,
  Building2,
  UserCircle,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';

import { useCreateWorkspace } from '@/hooks/queries/useWorkspaces';
import { useLinkEmployee, useCompleteOnboarding } from '@/hooks/queries/useRoleContext';
import { useAuthentication } from '@/hooks/use-authentication';
import { setWorkspacePublicId } from '@/lib/auth';

export const Route = createFileRoute('/onboarding')({
  beforeLoad: ({ context }) => {
    const auth = (context as { authentication?: { status: string } }).authentication;
    if (auth?.status === 'unauthenticated') {
      throw redirect({ to: '/sign-in' });
    }
  },
  component: OnboardingPage,
});

type Step = 'welcome' | 'role' | 'owner-form' | 'employee-link';
type Role = 'owner' | 'employee' | null;

const stepVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthentication();
  const createWorkspace = useCreateWorkspace();
  const linkEmployee = useLinkEmployee();
  const completeOnboarding = useCompleteOnboarding();

  const [step, setStep] = useState<Step>('welcome');
  const [role, setRole] = useState<Role>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [employeePublicId, setEmployeePublicId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const userPublicId = user?.publicId ?? '';

  const handleCopyPublicId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(userPublicId);
      setCopied(true);
      toast.success(t('onboarding.copied', 'Copied to clipboard'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('onboarding.copyFailed', 'Failed to copy'));
    }
  }, [userPublicId, t]);

  const handleSelectRole = useCallback((selectedRole: 'owner' | 'employee') => {
    setRole(selectedRole);
    setStep(selectedRole === 'owner' ? 'owner-form' : 'employee-link');
  }, []);

  const handleCreateWorkspace = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const name = workspaceName.trim();
    if (!name) {
      toast.error(t('onboarding.workspaceNameRequired', 'Please enter a restaurant name'));
      return;
    }
    setLoading(true);
    try {
      const workspace = await createWorkspace.mutateAsync(name);
      setWorkspacePublicId(workspace.publicId);
      await completeOnboarding.mutateAsync();
      toast.success(t('onboarding.workspaceCreated', 'Workspace created!'));
      navigate({ to: '/console/dashboard' });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : t('onboarding.createFailed', 'Failed to create workspace');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [workspaceName, createWorkspace, completeOnboarding, navigate, t]);

  const handleLinkEmployee = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const id = employeePublicId.trim();
    if (!id) {
      toast.error(t('onboarding.employeeIdRequired', 'Please enter an employee ID'));
      return;
    }
    setLoading(true);
    try {
      await linkEmployee.mutateAsync(id);
      await completeOnboarding.mutateAsync();
      toast.success(t('onboarding.linked', 'Successfully linked to your workplace!'));
      navigate({ to: '/console/dashboard' });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : t('onboarding.linkFailed', 'Failed to link employee');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [employeePublicId, linkEmployee, completeOnboarding, navigate, t]);

  const handleSkipEmployee = useCallback(async () => {
    setLoading(true);
    try {
      await completeOnboarding.mutateAsync();
      navigate({ to: '/console/dashboard' });
    } catch {
      toast.error(t('onboarding.skipFailed', 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  }, [completeOnboarding, navigate, t]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12 relative">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="text-center"
            >
              <WelcomeStep onContinue={() => setStep('role')} />
            </motion.div>
          )}

          {step === 'role' && (
            <motion.div
              key="role"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <RoleSelectionStep onSelect={handleSelectRole} onSkip={handleSkipEmployee} />
            </motion.div>
          )}

          {step === 'owner-form' && (
            <motion.div
              key="owner-form"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <OwnerFormStep
                workspaceName={workspaceName}
                onWorkspaceNameChange={setWorkspaceName}
                onSubmit={handleCreateWorkspace}
                onBack={() => setStep('role')}
                loading={loading}
              />
            </motion.div>
          )}

          {step === 'employee-link' && (
            <motion.div
              key="employee-link"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <EmployeeLinkStep
                userPublicId={userPublicId}
                copied={copied}
                onCopy={handleCopyPublicId}
                employeePublicId={employeePublicId}
                onEmployeePublicIdChange={setEmployeePublicId}
                onSubmit={handleLinkEmployee}
                onSkip={handleSkipEmployee}
                onBack={() => setStep('role')}
                loading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step components                                                           */
/* -------------------------------------------------------------------------- */

function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center">
      {/* Animated coffee icon */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 bg-gradient-to-br from-amber-light to-coffee shadow-[0_6px_20px_rgba(107,66,38,0.30)]"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <Coffee size={36} color="white" strokeWidth={1.8} />
        </motion.div>
      </motion.div>

      <h1 className="text-[30px] font-semibold text-text-primary font-serif mb-2">
        {t('onboarding.welcomeTitle', 'Welcome to DailyBrew')}
      </h1>
      <p className="text-[16px] text-text-secondary font-sans mb-10">
        {t('onboarding.welcomeSubtitle', 'Staff attendance, brewed simply')}
      </p>

      <button
        onClick={onContinue}
        className="flex items-center gap-2 px-8 py-3 rounded-xl text-[17px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(107,66,38,0.30)]"
      >
        {t('onboarding.getStarted', 'Get started')}
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

function RoleSelectionStep({ onSelect, onSkip }: { onSelect: (role: 'owner' | 'employee') => void; onSkip: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-2">
        {t('onboarding.roleTitle', 'How will you use DailyBrew?')}
      </h2>
      <p className="text-[15px] text-text-secondary font-sans mb-8">
        {t('onboarding.roleSubtitle', 'Are you a restaurant owner or a staff member?')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Owner card */}
        <button
          onClick={() => onSelect('owner')}
          className="group relative glass-card p-6 cursor-pointer text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(107,66,38,0.12)] hover:border-coffee/30"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-amber to-coffee shadow-[0_3px_10px_rgba(107,66,38,0.20)]">
            <Building2 size={22} color="white" strokeWidth={1.8} />
          </div>
          <p className="text-[16px] font-semibold text-text-primary font-sans mb-1">
            {t('onboarding.ownerTitle', 'I own a restaurant')}
          </p>
          <p className="text-[14px] text-text-secondary font-sans leading-relaxed">
            {t('onboarding.ownerDescription', 'Create your workspace and manage staff')}
          </p>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight size={16} className="text-coffee" />
          </div>
        </button>

        {/* Employee card */}
        <button
          onClick={() => onSelect('employee')}
          className="group relative glass-card p-6 cursor-pointer text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(107,66,38,0.12)] hover:border-coffee/30"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-blue to-[#1a3a5c] shadow-[0_3px_10px_rgba(59,111,160,0.20)]">
            <UserCircle size={22} color="white" strokeWidth={1.8} />
          </div>
          <p className="text-[16px] font-semibold text-text-primary font-sans mb-1">
            {t('onboarding.employeeTitle', "I'm a staff member")}
          </p>
          <p className="text-[14px] text-text-secondary font-sans leading-relaxed">
            {t('onboarding.employeeDescription', 'Get linked to your workplace')}
          </p>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight size={16} className="text-blue" />
          </div>
        </button>
      </div>

      <button
        onClick={onSkip}
        className="mt-6 text-[14.5px] text-text-tertiary hover:text-text-secondary font-sans bg-transparent border-none cursor-pointer transition-colors"
      >
        {t('onboarding.skipForNow', 'Skip for now')}
      </button>
    </div>
  );
}

function OwnerFormStep({
  workspaceName,
  onWorkspaceNameChange,
  onSubmit,
  onBack,
  loading,
}: {
  workspaceName: string;
  onWorkspaceNameChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 bg-gradient-to-br from-amber to-coffee shadow-[0_3px_10px_rgba(107,66,38,0.20)]">
        <Building2 size={24} color="white" strokeWidth={1.8} />
      </div>

      <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-2">
        {t('onboarding.createWorkspaceTitle', 'Name your restaurant')}
      </h2>
      <p className="text-[15px] text-text-secondary font-sans mb-8">
        {t(
          'onboarding.createWorkspaceSubtitle',
          'This is the workspace where you will manage your staff.',
        )}
      </p>

      <div className="glass-card p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="text-left">
            <label className="block text-[14px] font-medium text-text-secondary mb-1.5 font-sans">
              {t('onboarding.restaurantName', 'Restaurant name')}
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => onWorkspaceNameChange(e.target.value)}
              placeholder={t('onboarding.restaurantPlaceholder', 'e.g. Caf\u00e9 Mekong')}
              autoFocus
              className="w-full px-3.5 py-3 rounded-xl text-[16px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-2 focus:ring-coffee/15 transition-all font-sans placeholder:text-text-tertiary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[16px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(107,66,38,0.30)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t('common.loading', 'Creating...')
              : t('onboarding.createWorkspace', 'Create workspace')}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>

      <button
        onClick={onBack}
        className="mt-5 text-[14.5px] text-text-tertiary hover:text-text-secondary font-sans bg-transparent border-none cursor-pointer transition-colors"
      >
        {t('onboarding.back', 'Back')}
      </button>
    </div>
  );
}

function EmployeeLinkStep({
  userPublicId,
  copied,
  onCopy,
  employeePublicId,
  onEmployeePublicIdChange,
  onSubmit,
  onSkip,
  onBack,
  loading,
}: {
  userPublicId: string;
  copied: boolean;
  onCopy: () => void;
  employeePublicId: string;
  onEmployeePublicIdChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSkip: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 bg-gradient-to-br from-blue to-[#1a3a5c] shadow-[0_3px_10px_rgba(59,111,160,0.20)]">
        <UserCircle size={24} color="white" strokeWidth={1.8} />
      </div>

      <h2 className="text-[24px] font-semibold text-text-primary font-serif mb-2">
        {t('onboarding.employeeLinkTitle', 'Link to your workplace')}
      </h2>
      <p className="text-[15px] text-text-secondary font-sans mb-8">
        {t(
          'onboarding.employeeLinkSubtitle',
          'Ask your employer for your Employee ID, then enter it below to link your account.',
        )}
      </p>

      <div className="glass-card p-6 space-y-6">
        {/* Your public ID section */}
        <div className="text-left">
          <label className="block text-[13px] font-medium uppercase tracking-wider text-text-tertiary mb-2 font-sans">
            {t('onboarding.yourId', 'Your user ID')}
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3.5 py-2.5 rounded-lg bg-cream-2 border border-cream-3 text-[15px] text-text-primary font-mono tabular-nums truncate select-all">
              {userPublicId}
            </div>
            <button
              type="button"
              onClick={onCopy}
              className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-cream-2 border border-cream-3 cursor-pointer transition-all duration-150 hover:bg-cream-3"
              title={t('onboarding.copy', 'Copy')}
            >
              {copied ? (
                <Check size={16} className="text-green" />
              ) : (
                <Copy size={16} className="text-text-secondary" />
              )}
            </button>
          </div>
          <p className="text-[13px] text-text-tertiary mt-2 font-sans leading-relaxed">
            {t(
              'onboarding.shareIdHint',
              'Share this with your restaurant owner so they can add you as an employee.',
            )}
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-cream-3/80" />
          <span className="text-[13px] text-text-tertiary uppercase tracking-wider font-sans">
            {t('onboarding.or', 'or')}
          </span>
          <div className="flex-1 h-px bg-cream-3/80" />
        </div>

        {/* Self-link form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="text-left">
            <label className="block text-[14px] font-medium text-text-secondary mb-1.5 font-sans">
              {t('onboarding.enterEmployeeId', 'Enter your employee ID')}
            </label>
            <input
              type="text"
              value={employeePublicId}
              onChange={(e) => onEmployeePublicIdChange(e.target.value)}
              placeholder={t('onboarding.employeeIdPlaceholder', 'Ask your employer for your Employee ID')}
              className="w-full px-3.5 py-3 rounded-xl text-[16px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-2 focus:ring-coffee/15 transition-all font-sans placeholder:text-text-tertiary"
            />
            <p className="text-[13px] text-text-tertiary mt-1.5 font-sans leading-relaxed">
              {t(
                'onboarding.employeeIdHint',
                'Your employer creates your employee profile and gives you this ID to link your account.',
              )}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !employeePublicId.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[16px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(107,66,38,0.30)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t('common.loading', 'Linking...')
              : t('onboarding.linkAccount', 'Link my account')}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>

      {/* Skip + Back */}
      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          onClick={onBack}
          className="text-[14.5px] text-text-tertiary hover:text-text-secondary font-sans bg-transparent border-none cursor-pointer transition-colors"
        >
          {t('onboarding.back', 'Back')}
        </button>
        <span className="text-text-tertiary text-[12px]">&middot;</span>
        <button
          onClick={onSkip}
          disabled={loading}
          className="text-[14.5px] text-text-tertiary hover:text-text-secondary font-sans bg-transparent border-none cursor-pointer transition-colors disabled:opacity-50"
        >
          {t('onboarding.skipForNow', 'Skip for now')}
        </button>
      </div>
    </div>
  );
}
