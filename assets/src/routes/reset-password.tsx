import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResetPassword } from '@/hooks/queries/useProfile';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>): { token: string } => {
    return { token: (search.token as string) || '' };
  },
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const resetPassword = useResetPassword();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error(t('auth.passwordMinLength', 'Password must be at least 8 characters'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch', 'Passwords do not match'));
      return;
    }

    if (!token) {
      toast.error(t('auth.invalidResetToken', 'Invalid or missing reset token'));
      return;
    }

    try {
      await resetPassword.mutateAsync({ token, password });
      toast.success(t('auth.passwordResetSuccess', 'Password reset successfully'));
      navigate({ to: '/sign-in' });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : t('auth.passwordResetError', 'Failed to reset password. The link may have expired.');
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm page-enter">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="no-underline">
            <h1 className="text-[24px] font-semibold text-coffee font-serif mb-1">
              DailyBrew
            </h1>
          </Link>
          <p className="text-[13px] text-text-secondary">
            {t('auth.setNewPassword', 'Set a new password')}
          </p>
        </div>

        <div className="glass-card !rounded-2xl p-6 hover:!transform-none">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                {t('auth.newPassword', 'New password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="8+ characters"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                {t('auth.confirmPassword', 'Confirm password')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="8+ characters"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={resetPassword.isPending}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] disabled:opacity-50"
            >
              {resetPassword.isPending
                ? t('common.loading', 'Loading...')
                : t('auth.resetPassword', 'Reset password')}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              to="/sign-in"
              className="text-[12px] text-coffee font-medium no-underline hover:text-coffee-light transition-colors"
            >
              {t('auth.backToSignIn', 'Back to sign in')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
