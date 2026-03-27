import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForgotPassword } from '@/hooks/queries/useProfile';
import { toast } from 'sonner';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword.mutateAsync(email);
      setSubmitted(true);
    } catch {
      toast.error(t('auth.forgotPasswordError', 'Something went wrong. Please try again.'));
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
            {t('auth.resetYourPassword', 'Reset your password')}
          </p>
        </div>

        <div className="glass-card !rounded-2xl p-6 hover:!transform-none">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-[13.5px] text-text-primary font-medium mb-2">
                {t('auth.checkYourEmail', 'Check your email')}
              </p>
              <p className="text-[12.5px] text-text-secondary leading-relaxed mb-6">
                {t(
                  'auth.resetLinkSent',
                  'If an account exists, a reset link has been sent to your email.',
                )}
              </p>
              <Link
                to="/sign-in"
                className="text-[13px] text-coffee font-medium no-underline hover:text-coffee-light transition-colors"
              >
                {t('auth.backToSignIn', 'Back to sign in')}
              </Link>
            </div>
          ) : (
            <>
              <p className="text-[13px] text-text-secondary mb-5 leading-relaxed">
                {t(
                  'auth.forgotPasswordDescription',
                  'Enter the email address associated with your account and we\'ll send you a link to reset your password.',
                )}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                    {t('auth.email', 'Email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-lg text-[13.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
                    placeholder="you@restaurant.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotPassword.isPending}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] disabled:opacity-50"
                >
                  {forgotPassword.isPending
                    ? t('common.loading', 'Loading...')
                    : t('auth.sendResetLink', 'Send reset link')}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
