import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
});

function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and privacy policy');
      return;
    }
    setLoading(true);
    try {
      await register(email, password);
      // Redirect to onboarding — workspace creation happens there
      navigate({ to: '/onboarding' });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
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
            Get started for free
          </p>
        </div>

        <div className="glass-card !rounded-2xl p-6 hover:!transform-none">
          {/* OAuth buttons */}
          <div className="space-y-2.5 mb-5">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-[13px] font-medium bg-white/70 border border-cream-3 text-text-primary cursor-pointer transition-all duration-150 hover:bg-cream-3/50 hover:border-cream-3"
            >
              <GoogleIcon />
              Sign up with Google
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-[13px] font-medium bg-white/70 border border-cream-3 text-text-primary cursor-pointer transition-all duration-150 hover:bg-cream-3/50 hover:border-cream-3"
            >
              <AppleIcon />
              Sign up with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-cream-3/80" />
            <span className="text-[11px] text-text-tertiary uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-cream-3/80" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@restaurant.com"
                className="w-full px-3 py-2.5 rounded-lg text-[13.5px] bg-white/60 border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-text-secondary mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="8+ characters"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-[13.5px] bg-white/60 border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
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

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-cream-3 accent-coffee"
              />
              <span className="text-[11.5px] text-text-secondary leading-snug">
                I agree to the{' '}
                <Link to="/terms" className="text-coffee no-underline hover:text-coffee-light font-medium">
                  Terms of Use
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-coffee no-underline hover:text-coffee-light font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-medium bg-coffee text-white border-none cursor-pointer transition-all duration-150 hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('auth.signUp')}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-[12px] text-text-tertiary">
              {t('auth.hasAccount')}{' '}
              <Link to="/sign-in" className="text-coffee font-medium no-underline hover:text-coffee-light">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>

        {/* Legal links */}
        <div className="mt-6 text-center space-x-3">
          <Link to="/privacy" className="text-[11px] text-text-tertiary hover:text-text-secondary no-underline transition-colors">
            Privacy
          </Link>
          <span className="text-[11px] text-text-tertiary">&middot;</span>
          <Link to="/terms" className="text-[11px] text-text-tertiary hover:text-text-secondary no-underline transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}
