import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { toast } from 'sonner';
import { Eye, EyeOff, QrCode, Users, Clock, LayoutDashboard, Shield, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { loadAppleSDK, appleSignIn } from '@/lib/oauth';
import { LogoBrand } from '@/components/shared/Logo';
import { motion } from 'framer-motion';

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  agreedToTerms: z.literal(true, { message: 'You must agree to the terms' }),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
});

const floatingIcons = [
  { icon: <QrCode size={20} />, x: '8%', y: '18%', delay: 0, color: '#C17F3B' },
  { icon: <Users size={20} />, x: '85%', y: '22%', delay: 0.8, color: '#4A7C59' },
  { icon: <Clock size={20} />, x: '12%', y: '72%', delay: 1.6, color: '#3B6FA0' },
  { icon: <LayoutDashboard size={20} />, x: '88%', y: '65%', delay: 0.4, color: '#9B6B45' },
  { icon: <Shield size={18} />, x: '6%', y: '45%', delay: 1.2, color: '#C0392B' },
  { icon: <MapPin size={18} />, x: '92%', y: '45%', delay: 2.0, color: '#7C5C9B' },
];

function SignUpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register: registerUser, loginWithApple } = useAuth();
  const auth = useAuthenticationState();
  const [showPassword, setShowPassword] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', agreedToTerms: false as unknown as true },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (auth.status === 'authenticated') {
      navigate({ to: '/console/dashboard', replace: true });
    }
  }, [auth.status, navigate]);

  const onSubmit = async (data: SignUpForm) => {
    try {
      await registerUser(data.email, data.password, data.firstName, data.lastName);
      window.location.href = '/onboarding';
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response: { data: { message: string } } }).response?.data?.message
          : 'Registration failed';
      toast.error(message);
    }
  };

  const handleAppleSignIn = useCallback(async () => {
    setAppleLoading(true);
    try {
      const clientId = window.__DAILYBREW__?.appleClientId;
      if (!clientId) throw new Error('Apple client ID not configured');
      await loadAppleSDK();
      const { identityToken, email } = await appleSignIn(clientId, window.location.origin);
      const result = await loginWithApple(identityToken, email);
      if (result?.user?.onboardingCompleted === false) {
        navigate({ to: '/onboarding' });
      } else {
        window.location.href = '/console/dashboard';
      }
    } catch {
      toast.error('Apple sign-in failed');
    } finally {
      setAppleLoading(false);
    }
  }, [loginWithApple, navigate]);

  if (auth.status === 'authenticated') return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-amber/[0.06] blur-[100px]"
          animate={{ y: [0, 25, 0], x: [0, 12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-coffee/[0.05] blur-[100px]"
          animate={{ y: [0, -18, 0], x: [0, -12, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Floating feature icons */}
      {floatingIcons.map((item, i) => (
        <motion.div
          key={i}
          className="absolute hidden md:flex w-10 h-10 rounded-xl items-center justify-center pointer-events-none"
          style={{
            left: item.x,
            top: item.y,
            background: `${item.color}10`,
            color: item.color,
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            y: [0, -12, 0],
            scale: 1,
          }}
          transition={{
            opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: item.delay },
            y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: item.delay },
            scale: { duration: 0.6, delay: item.delay },
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      <div className="w-full max-w-sm page-enter relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="no-underline inline-block">
            <LogoBrand size={36} className="justify-center" />
          </Link>
          <p className="text-[15px] text-text-secondary mt-2">Get started for free</p>
        </div>

        <div className="glass-card !rounded-2xl p-6 hover:!transform-none">
          {/* OAuth */}
          <div className="space-y-2.5 mb-5">
            <a
              href="/oauth/auth/google"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg border border-cream-3 text-text-primary no-underline transition-all hover:bg-cream-3/50"
            >
              <GoogleIcon />
              Sign up with Google
            </a>
            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={appleLoading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-[15px] font-medium bg-glass-bg border border-cream-3 text-text-primary transition-all hover:bg-cream-3/50 cursor-pointer disabled:opacity-50"
            >
              <AppleIcon />
              {appleLoading ? t('common.loading') : 'Sign up with Apple'}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-cream-3/80" />
            <span className="text-[13px] text-text-tertiary uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-cream-3/80" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[14px] font-medium text-text-secondary mb-1.5">
                  {t('employee.firstName')}
                </label>
                <input
                  type="text"
                  {...register('firstName')}
                  placeholder="John"
                  className="w-full px-3 py-2.5 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
                />
                {errors.firstName && (
                  <p className="text-[13px] text-red mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-[14px] font-medium text-text-secondary mb-1.5">
                  {t('employee.lastName')}
                </label>
                <input
                  type="text"
                  {...register('lastName')}
                  placeholder="Doe"
                  className="w-full px-3 py-2.5 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
                />
                {errors.lastName && (
                  <p className="text-[13px] text-red mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[14px] font-medium text-text-secondary mb-1.5">
                {t('auth.email')}
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="you@restaurant.com"
                className="w-full px-3 py-2.5 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
              />
              {errors.email && (
                <p className="text-[13px] text-red mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-[14px] font-medium text-text-secondary mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="8+ characters"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-[15.5px] bg-glass-bg border border-cream-3 text-text-primary outline-none focus:border-coffee focus:ring-1 focus:ring-coffee/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[13px] text-red mt-1">{errors.password.message}</p>
              )}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                {...register('agreedToTerms')}
                className="mt-0.5 w-4 h-4 rounded border-cream-3 accent-coffee"
              />
              <span className="text-[13.5px] text-text-secondary leading-snug">
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
            {errors.agreedToTerms && (
              <p className="text-[13px] text-red">{errors.agreedToTerms.message}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 rounded-lg text-[15px] font-medium bg-coffee text-white border-none cursor-pointer transition-all hover:bg-coffee-light hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,66,38,0.25)] disabled:opacity-50"
            >
              {isSubmitting ? t('common.loading') : t('auth.signUp')}
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-[14px] text-text-tertiary">
              {t('auth.hasAccount')}{' '}
              <Link to="/sign-in" className="text-coffee font-medium no-underline hover:text-coffee-light">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center space-x-3">
          <Link to="/privacy" className="text-[13px] text-text-tertiary hover:text-text-secondary no-underline transition-colors">Privacy</Link>
          <span className="text-[13px] text-text-tertiary">&middot;</span>
          <Link to="/terms" className="text-[13px] text-text-tertiary hover:text-text-secondary no-underline transition-colors">Terms</Link>
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
