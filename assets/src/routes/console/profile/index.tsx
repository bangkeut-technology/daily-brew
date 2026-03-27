import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '@/hooks/use-authentication';
import {
  useUpdateProfile,
  useChangePassword,
  useOAuthConnections,
  useDisconnectOAuth,
} from '@/hooks/queries/useProfile';
import { useTheme } from 'next-themes';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard, GlassCardHeader } from '@/components/shared/GlassCard';
import { Avatar } from '@/components/shared/Avatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from 'sonner';
import { Eye, EyeOff, Sun, Moon, Monitor, Check } from 'lucide-react';

export const Route = createFileRoute('/console/profile/')({
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuthentication();
  const { theme, setTheme } = useTheme();

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

  // Mutations
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const disconnectOAuth = useDisconnectOAuth();

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
        onSuccess: () => {
          toast.success(t('profile.updateSuccess', 'Profile updated successfully'));
        },
        onError: () => {
          toast.error(t('profile.updateError', 'Failed to update profile'));
        },
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
      {
        currentPassword,
        newPassword,
      },
      {
        onSuccess: () => {
          toast.success(t('profile.passwordChanged', 'Password changed successfully'));
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordErrors([]);
        },
        onError: () => {
          toast.error(
            t('profile.passwordChangeError', 'Failed to change password. Check your current password.'),
          );
        },
      },
    );
  };

  const handleDisconnect = (provider: 'google' | 'apple') => {
    if (!oauthData) return;

    // Check if disconnecting would leave user with no login method
    const otherProvider = provider === 'google' ? 'apple' : 'google';
    const hasOtherProvider = oauthData[otherProvider];
    const hasPassword = oauthData.hasPassword;

    if (!hasPassword && !hasOtherProvider) {
      toast.error(
        t(
          'profile.cannotDisconnect',
          'Cannot disconnect. You need at least one login method (password or another OAuth provider).',
        ),
      );
      return;
    }

    disconnectOAuth.mutate(provider, {
      onSuccess: () => {
        toast.success(
          t('profile.oauthDisconnected', '{{provider}} disconnected successfully', {
            provider: provider.charAt(0).toUpperCase() + provider.slice(1),
          }),
        );
      },
      onError: () => {
        toast.error(t('profile.oauthDisconnectError', 'Failed to disconnect provider'));
      },
    });
  };

  const handleConnect = (provider: 'google' | 'apple') => {
    toast.info(
      t('profile.connectViaSignIn', 'To connect {{provider}}, sign in with that provider from the sign-in page.', {
        provider: provider.charAt(0).toUpperCase() + provider.slice(1),
      }),
    );
  };

  const themeOptions = [
    { value: 'light', icon: Sun, label: t('profile.themeLight', 'Light') },
    { value: 'dark', icon: Moon, label: t('profile.themeDark', 'Dark') },
    { value: 'system', icon: Monitor, label: t('profile.themeSystem', 'System') },
  ] as const;

  const localeOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Francais' },
    { value: 'km', label: 'Khmer' },
  ];

  return (
    <div className="page-enter">
      <PageHeader title={t('nav.profile', 'Profile')} />

      <div className="max-w-2xl space-y-6">
        {/* Section 1: Profile Info Card */}
        <GlassCard hover={false}>
          <GlassCardHeader title={t('profile.profileInfo', 'Profile information')} />
          <form onSubmit={handleProfileSubmit} className="p-6">
            <div className="flex flex-col items-center mb-6">
              <Avatar name={displayName} index={0} size={64} radius="20px" />
              <p className="text-[16px] font-semibold text-text-primary mt-3">{displayName}</p>
              <p className="text-[12px] text-text-tertiary mt-1">{user?.email}</p>
            </div>

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
                    className="w-full px-3 py-2.5 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-[#6B4226]/20 transition-all"
                    placeholder={t('profile.firstNamePlaceholder', 'Your first name')}
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
                    className="w-full px-3 py-2.5 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-[#6B4226]/20 transition-all"
                    placeholder={t('profile.lastNamePlaceholder', 'Your last name')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {t('profile.locale', 'Language')}
                </label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-[#6B4226]/20 transition-all cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237C6860' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                  }}
                >
                  {localeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={updateProfile.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateProfile.isPending
                  ? t('common.saving', 'Saving...')
                  : t('common.save', 'Save changes')}
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Section 2: Change Password Card */}
        <GlassCard hover={false}>
          <GlassCardHeader title={t('profile.changePassword', 'Change password')} />
          <form onSubmit={handlePasswordSubmit} className="p-6">
            <div className="space-y-4">
              {/* Show current password field only if user has a password */}
              {oauthData?.hasPassword !== false && (
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                    {t('profile.currentPassword', 'Current password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2.5 pr-10 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-[#6B4226]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {t('profile.newPassword', 'New password')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordErrors.length) setPasswordErrors([]);
                    }}
                    className="w-full px-3 py-2.5 pr-10 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-[#6B4226]/20 transition-all"
                    placeholder={t('profile.newPasswordPlaceholder', 'At least 8 characters')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer bg-transparent border-none p-0"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                  {t('profile.confirmPassword', 'Confirm new password')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordErrors.length) setPasswordErrors([]);
                    }}
                    className="w-full px-3 py-2.5 pr-10 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-[#6B4226]/20 transition-all"
                    placeholder={t('profile.confirmPasswordPlaceholder', 'Re-enter your new password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer bg-transparent border-none p-0"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Validation errors */}
              {passwordErrors.length > 0 && (
                <div className="rounded-lg bg-red/8 border border-[#C0392B]/15 px-3 py-2.5">
                  {passwordErrors.map((err, i) => (
                    <p key={i} className="text-[12px] text-red leading-relaxed">
                      {err}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={changePassword.isPending || (!newPassword && !confirmPassword)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changePassword.isPending
                  ? t('common.saving', 'Saving...')
                  : t('profile.updatePassword', 'Update password')}
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Section 3: OAuth Connections Card */}
        <GlassCard hover={false}>
          <GlassCardHeader title={t('profile.oauthConnections', 'Connected accounts')} />
          <div className="p-6 space-y-4">
            {oauthLoading ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-[13px] text-text-tertiary">{t('common.loading', 'Loading...')}</p>
              </div>
            ) : (
              <>
                {/* Google row */}
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/40 border border-cream-3/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/80 border border-cream-3 flex items-center justify-center">
                      <GoogleIcon />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-medium text-text-primary">Google</p>
                      <p className="text-[11px] text-text-tertiary mt-0.5">
                        {oauthData?.google
                          ? t('profile.connected', 'Connected')
                          : t('profile.notConnected', 'Not connected')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {oauthData?.google && <StatusBadge label={t('profile.connected', 'Connected')} variant="green" />}
                    {oauthData?.google ? (
                      <button
                        type="button"
                        onClick={() => handleDisconnect('google')}
                        disabled={disconnectOAuth.isPending}
                        className="text-[11.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer bg-red/10 text-red transition-colors hover:bg-red/18 disabled:opacity-50"
                      >
                        {t('profile.disconnect', 'Disconnect')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConnect('google')}
                        className="text-[11.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer bg-coffee/10 text-coffee transition-colors hover:bg-coffee/18"
                      >
                        {t('profile.connect', 'Connect')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Apple row */}
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/40 border border-cream-3/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/80 border border-cream-3 flex items-center justify-center">
                      <AppleIcon />
                    </div>
                    <div>
                      <p className="text-[13.5px] font-medium text-text-primary">Apple</p>
                      <p className="text-[11px] text-text-tertiary mt-0.5">
                        {oauthData?.apple
                          ? t('profile.connected', 'Connected')
                          : t('profile.notConnected', 'Not connected')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {oauthData?.apple && <StatusBadge label={t('profile.connected', 'Connected')} variant="green" />}
                    {oauthData?.apple ? (
                      <button
                        type="button"
                        onClick={() => handleDisconnect('apple')}
                        disabled={disconnectOAuth.isPending}
                        className="text-[11.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer bg-red/10 text-red transition-colors hover:bg-red/18 disabled:opacity-50"
                      >
                        {t('profile.disconnect', 'Disconnect')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConnect('apple')}
                        className="text-[11.5px] font-medium px-3 py-1 rounded-md border-none cursor-pointer bg-coffee/10 text-coffee transition-colors hover:bg-coffee/18"
                      >
                        {t('profile.connect', 'Connect')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Warning if only one method left */}
                {oauthData && !oauthData.hasPassword && [oauthData.google, oauthData.apple].filter(Boolean).length <= 1 && (
                  <div className="rounded-lg bg-amber/8 border border-[#C17F3B]/15 px-4 py-3">
                    <p className="text-[12px] text-amber leading-relaxed">
                      {t(
                        'profile.singleMethodWarning',
                        'You have only one login method. Set a password or connect another provider before disconnecting.',
                      )}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </GlassCard>

        {/* Section 4: Theme Preference Card */}
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
                        : 'bg-white/40 border-cream-3 hover:bg-cream-3/40 hover:border-cream-3'
                    }`}
                  >
                    <Icon
                      size={20}
                      className={isActive ? 'text-coffee' : 'text-text-secondary'}
                    />
                    <span
                      className={`text-[12px] font-medium ${
                        isActive ? 'text-coffee' : 'text-text-secondary'
                      }`}
                    >
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
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
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
