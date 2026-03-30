import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '@/hooks/use-authentication';
import {
  useUpdateProfile,
  useChangePassword,
  useOAuthConnections,
  useDisconnectOAuth,
  useDeleteAccount,
} from '@/hooks/queries/useProfile';
import { useRoleContext, useLinkEmployee } from '@/hooks/queries/useRoleContext';
import { useTheme } from 'next-themes';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  Check,
  Copy,
  Link2,
  UserCheck,
  Mail,
  Globe,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { CustomSelect } from '@/components/shared/CustomSelect';

export const Route = createFileRoute('/console/profile/')({
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuthentication();
  const { theme, setTheme } = useTheme();
  const { data: roleContext } = useRoleContext();

  // Profile form state
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [locale, setLocale] = useState(user?.locale ?? 'en');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Employee linking state
  const [employeeId, setEmployeeId] = useState('');
  const [idCopied, setIdCopied] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Mutations
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const disconnectOAuth = useDisconnectOAuth();
  const linkEmployee = useLinkEmployee();
  const deleteAccount = useDeleteAccount();

  // OAuth connections query
  const { data: oauthData, isLoading: oauthLoading } = useOAuthConnections();

  // Sync form when user changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
      setLocale(user.locale ?? 'en');
    }
  }, [user]);

  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email ||
    'User';

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        locale,
      },
      {
        onSuccess: () => toast.success(t('profile.updateSuccess', 'Profile updated')),
        onError: () => toast.error(t('profile.updateError', 'Failed to update profile')),
      },
    );
  };

  const validatePassword = (): boolean => {
    const errors: string[] = [];
    if (newPassword.length < 8) {
      errors.push(t('profile.passwordMinLength', 'Password must be at least 8 characters'));
    }
    if (newPassword !== confirmPassword) {
      errors.push(t('profile.passwordsMustMatch', 'Passwords do not match'));
    }
    if (oauthData?.hasPassword && !currentPassword) {
      errors.push(t('profile.currentPasswordRequired', 'Current password is required'));
    }
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success(t('profile.passwordChanged', 'Password changed'));
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordErrors([]);
        },
        onError: () => {
          toast.error(t('profile.passwordChangeError', 'Failed to change password'));
        },
      },
    );
  };

  const handleDisconnect = (provider: 'google' | 'apple') => {
    if (!oauthData) return;
    const otherProvider = provider === 'google' ? 'apple' : 'google';
    if (!oauthData.hasPassword && !oauthData[otherProvider]) {
      toast.error(t('profile.cannotDisconnect', 'You need at least one login method.'));
      return;
    }
    disconnectOAuth.mutate(provider, {
      onSuccess: () => toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} disconnected`),
      onError: () => toast.error(t('profile.oauthDisconnectError', 'Failed to disconnect')),
    });
  };

  const handleCopyPublicId = () => {
    if (!user?.publicId) return;
    navigator.clipboard.writeText(user.publicId);
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  };

  const handleLinkEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const id = employeeId.trim();
    if (!id) return;
    linkEmployee.mutate(id, {
      onSuccess: () => {
        toast.success(t('profile.employeeLinked', 'Employee linked successfully'));
        setEmployeeId('');
      },
      onError: () => {
        toast.error(t('profile.employeeLinkError', 'Failed to link employee. Check the ID.'));
      },
    });
  };

  const handleDeleteAccount = () => {
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        window.location.href = '/sign-in';
      },
      onError: () => {
        toast.error(t('profile.deleteError', 'Failed to delete account'));
      },
    });
  };

  const localeOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Fran\u00e7ais' },
    { value: 'km', label: '\u1797\u17b6\u179f\u17b6\u1781\u17d2\u1798\u17c2\u179a' },
  ];

  const themeOptions = [
    { value: 'light', icon: Sun, label: t('profile.themeLight', 'Light') },
    { value: 'dark', icon: Moon, label: t('profile.themeDark', 'Dark') },
    { value: 'system', icon: Monitor, label: t('profile.themeSystem', 'System') },
  ] as const;

  return (
    <div className="page-enter">
      <PageHeader title={t('nav.profile', 'Profile')} />

      <div className="space-y-6">
        {/* Profile header card */}
        <GlassCard hover={false}>
          <div className="p-6">
            <div className="flex items-start gap-5">
              <Avatar name={displayName} index={0} size={64} radius="20px" />
              <div className="flex-1 min-w-0">
                <h2
                  className="text-[20px] font-semibold text-text-primary leading-tight"
                  style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif" }}
                >
                  {displayName}
                </h2>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Mail size={12} className="text-text-tertiary" />
                  <span className="text-[12.5px] text-text-secondary">{user?.email}</span>
                </div>
                {roleContext && (
                  <div className="flex items-center gap-2 mt-2.5">
                    {roleContext.isOwner && <StatusBadge label="Owner" variant="amber" />}
                    {roleContext.isEmployee && <StatusBadge label="Employee" variant="blue" />}
                  </div>
                )}
              </div>
            </div>

            {/* Public ID */}
            <div className="mt-5 pt-5 border-t border-cream-3/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[1px] font-medium text-text-tertiary mb-1">
                    {t('profile.yourPublicId', 'Your public ID')}
                  </p>
                  <p className="text-[13px] font-mono text-text-secondary tabular-nums">
                    {user?.publicId}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPublicId}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium bg-glass-bg border border-cream-3 text-text-secondary cursor-pointer transition-all hover:bg-cream-3"
                >
                  {idCopied ? <Check size={13} className="text-green" /> : <Copy size={13} />}
                  {idCopied ? t('onboarding.idCopied', 'Copied!') : t('onboarding.copyId', 'Copy')}
                </button>
              </div>
              <p className="text-[11px] text-text-tertiary mt-1.5">
                {t('profile.publicIdHint', 'Share this with your employer so they can link you as an employee.')}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Employee linking (only if not already linked) */}
        {roleContext && !roleContext.isEmployee && (
          <GlassCard hover={false}>
            <GlassCardHeader
              title={t('profile.linkEmployee', 'Link to employee')}
              action={
                <div className="flex items-center gap-1.5">
                  <Link2 size={13} className="text-amber" />
                  <span className="text-[11px] text-amber font-medium">
                    {t('profile.optional', 'Optional')}
                  </span>
                </div>
              }
            />
            <form onSubmit={handleLinkEmployee} className="p-6">
              <p className="text-[12.5px] text-text-secondary mb-4 leading-relaxed">
                {t(
                  'profile.linkEmployeeDesc',
                  'If your employer gave you an employee public ID, enter it here to link your account. This lets you view your attendance and submit leave requests.',
                )}
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder={t('onboarding.employeePublicId', 'Employee public ID')}
                  className="flex-1 px-3 py-2.5 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all font-mono"
                />
                <button
                  type="submit"
                  disabled={linkEmployee.isPending || !employeeId.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light disabled:opacity-50"
                >
                  <UserCheck size={14} />
                  {t('profile.link', 'Link')}
                </button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Linked employee info (if linked) */}
        {roleContext?.employee && (
          <GlassCard hover={false}>
            <GlassCardHeader title={t('profile.linkedEmployee', 'Linked employee')} />
            <div className="p-6">
              <div className="flex items-center gap-4 py-3 px-4 rounded-xl bg-green/5 border border-green/15">
                <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center">
                  <UserCheck size={18} className="text-green" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium text-text-primary">
                    {roleContext.employee.name}
                  </p>
                  {roleContext.employee.workspaceName && (
                    <p className="text-[11px] text-text-tertiary mt-0.5">
                      {roleContext.employee.workspaceName}
                    </p>
                  )}
                </div>
                <StatusBadge label="Linked" variant="green" />
              </div>
            </div>
          </GlassCard>
        )}

        {/* Profile info form */}
        <GlassCard hover={false}>
          <GlassCardHeader title={t('profile.profileInfo', 'Profile information')} />
          <form onSubmit={handleProfileSubmit} className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                    {t('profile.firstName', 'First name')}
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                    {t('profile.lastName', 'Last name')}
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[12px] font-medium text-text-secondary mb-1.5">
                  <Globe size={12} />
                  {t('profile.locale', 'Language')}
                </label>
                <CustomSelect
                  value={locale}
                  onChange={setLocale}
                  options={localeOptions}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] disabled:opacity-50"
              >
                {updateProfile.isPending ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Change password */}
        <GlassCard hover={false}>
          <GlassCardHeader title={t('profile.changePassword', 'Change password')} />
          <form onSubmit={handlePasswordSubmit} className="p-6">
            <div className="space-y-4">
              {oauthData?.hasPassword !== false && (
                <PasswordField
                  label={t('profile.currentPassword', 'Current password')}
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  show={showCurrentPassword}
                  onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              )}
              <PasswordField
                label={t('profile.newPassword', 'New password')}
                value={newPassword}
                onChange={(v) => { setNewPassword(v); if (passwordErrors.length) setPasswordErrors([]); }}
                show={showNewPassword}
                onToggle={() => setShowNewPassword(!showNewPassword)}
                placeholder={t('profile.newPasswordPlaceholder', 'At least 8 characters')}
              />
              <PasswordField
                label={t('profile.confirmPassword', 'Confirm new password')}
                value={confirmPassword}
                onChange={(v) => { setConfirmPassword(v); if (passwordErrors.length) setPasswordErrors([]); }}
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                placeholder={t('profile.confirmPasswordPlaceholder', 'Re-enter your new password')}
              />
              {passwordErrors.length > 0 && (
                <div className="rounded-lg bg-red/8 border border-red/15 px-3 py-2.5">
                  {passwordErrors.map((err, i) => (
                    <p key={i} className="text-[12px] text-red leading-relaxed">{err}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={changePassword.isPending || (!newPassword && !confirmPassword)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] disabled:opacity-50"
              >
                {changePassword.isPending ? t('common.loading') : t('profile.updatePassword', 'Update password')}
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Connected accounts */}
        <GlassCard hover={false}>
          <GlassCardHeader title={t('profile.oauthConnections', 'Connected accounts')} />
          <div className="p-6 space-y-3">
            {oauthLoading ? (
              <p className="text-[13px] text-text-tertiary text-center py-4">{t('common.loading')}</p>
            ) : (
              <>
                <OAuthRow
                  provider="google"
                  icon={<GoogleIcon />}
                  connected={!!oauthData?.google}
                  onConnect={() => { window.location.href = '/oauth/connect/google'; }}
                  onDisconnect={() => handleDisconnect('google')}
                  isPending={disconnectOAuth.isPending}
                  t={t}
                />
                <OAuthRow
                  provider="apple"
                  icon={<AppleIcon />}
                  connected={!!oauthData?.apple}
                  onConnect={() => { window.location.href = '/oauth/connect/apple'; }}
                  onDisconnect={() => handleDisconnect('apple')}
                  isPending={disconnectOAuth.isPending}
                  t={t}
                />
                {oauthData && !oauthData.hasPassword && [oauthData.google, oauthData.apple].filter(Boolean).length <= 1 && (
                  <div className="rounded-lg bg-amber/8 border border-amber/15 px-4 py-3 mt-2">
                    <p className="text-[12px] text-amber leading-relaxed">
                      {t('profile.singleMethodWarning', 'You have only one login method. Set a password or connect another provider before disconnecting.')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </GlassCard>

        {/* Theme preference */}
        <GlassCard hover={false}>
          <GlassCardHeader title={t('profile.themePreference', 'Theme preference')} />
          <div className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTheme(opt.value)}
                    className={`relative flex flex-col items-center gap-2 py-4 px-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-coffee/8 border-coffee/40 shadow-[0_2px_8px_rgba(107,66,38,0.10)]'
                        : 'bg-glass-bg border-cream-3 hover:bg-cream-3/40'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-coffee' : 'text-text-secondary'} />
                    <span className={`text-[12px] font-medium ${isActive ? 'text-coffee' : 'text-text-secondary'}`}>
                      {opt.label}
                    </span>
                    {isActive && (
                      <span className="absolute top-2 right-2">
                        <Check size={14} className="text-coffee" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* Delete account */}
        <GlassCard hover={false}>
          <GlassCardHeader
            title={t('profile.deleteAccount', 'Delete account')}
            action={
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={13} className="text-red" />
                <span className="text-[11px] text-red font-medium">
                  {t('profile.danger', 'Danger')}
                </span>
              </div>
            }
          />
          <div className="p-6">
            {!showDeleteConfirm ? (
              <>
                <p className="text-[12.5px] text-text-secondary leading-relaxed mb-4">
                  {t(
                    'profile.deleteAccountDesc',
                    'Permanently delete your account and all associated data. This action cannot be undone.',
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-red/10 text-red border border-red/20 cursor-pointer transition-all hover:bg-red/18"
                >
                  <Trash2 size={14} />
                  {t('profile.deleteMyAccount', 'Delete my account')}
                </button>
              </>
            ) : (
              <div className="rounded-xl bg-red/5 border border-red/15 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-red">
                      {t('profile.deleteConfirmTitle', 'Are you sure?')}
                    </p>
                    <p className="text-[12px] text-text-secondary mt-1 leading-relaxed">
                      {t(
                        'profile.deleteConfirmDesc',
                        'Type "DELETE" below to confirm. Your account will be permanently deactivated.',
                      )}
                    </p>
                  </div>
                </div>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2.5 rounded-lg text-[13.5px] bg-glass-bg border border-red/20 text-text-primary outline-none focus:border-red focus:ring-1 focus:ring-red/20 transition-all font-mono"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || deleteAccount.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-red text-white border-none cursor-pointer transition-all hover:bg-red/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} />
                    {deleteAccount.isPending
                      ? t('common.loading')
                      : t('profile.confirmDelete', 'Delete permanently')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                    className="px-4 py-2 rounded-lg text-[13px] font-medium bg-glass-bg border border-cream-3 text-text-secondary cursor-pointer transition-all hover:bg-cream-3/50"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-text-secondary mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-10 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function OAuthRow({
  provider,
  icon,
  connected,
  onConnect,
  onDisconnect,
  isPending,
  t,
}: {
  provider: string;
  icon: React.ReactNode;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  isPending: boolean;
  t: ReturnType<typeof import('react-i18next').useTranslation>['t'];
}) {
  const label = provider.charAt(0).toUpperCase() + provider.slice(1);
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-glass-bg border border-cream-3/60">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-glass-bg border border-cream-3 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-[13.5px] font-medium text-text-primary">{label}</p>
          <p className="text-[11px] text-text-tertiary mt-0.5">
            {connected ? t('profile.connected', 'Connected') : t('profile.notConnected', 'Not connected')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        {connected && <StatusBadge label={t('profile.connected', 'Connected')} variant="green" />}
        {connected ? (
          <button
            type="button"
            onClick={onDisconnect}
            disabled={isPending}
            className="text-[11.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer bg-red/10 text-red transition-colors hover:bg-red/18 disabled:opacity-50"
          >
            {t('profile.disconnect', 'Disconnect')}
          </button>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            className="text-[11.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer bg-coffee/10 text-coffee transition-colors hover:bg-coffee/18"
          >
            {t('profile.connect', 'Connect')}
          </button>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-text-primary">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
