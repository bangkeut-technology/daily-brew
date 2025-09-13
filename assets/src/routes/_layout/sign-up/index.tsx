import * as React from 'react';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { signUpSchema } from '@/schema/sign-up-schema';
import { SignUp } from '@/types/user';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/field/text-field';
import { useTranslation } from 'react-i18next';
import { CheckboxField } from '@/components/field/checkbox-field';
import { useMutation } from '@tanstack/react-query';
import { signUp } from '@/services/auth';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { useAuthentication } from '@/hooks/use-authentication';
import { z } from 'zod';

export const Route = createFileRoute('/_layout/sign-up/')({
    component: SignUpPage,
    validateSearch: z.object({
        redirect: z.string().optional().default('/console'),
    }),
    beforeLoad: ({ context, search }) => {
        if (context.authentication?.isAuthenticated) {
            throw redirect({ to: (search.redirect as any) || '/console' });
        }
    },
});

function SignUpPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, setEmail } = useAuthentication();
    const { redirect } = Route.useSearch();
    const form = useForm<SignUp>({
        resolver: yupResolver(signUpSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            acceptedTerms: false,
        },
    });
    const { isPending, mutate } = useMutation({
        mutationFn: signUp,
        onSuccess: (data) => {
            sessionStorage.setItem('email', data.user.email);
            sessionStorage.setItem('locale', data.user.locale || 'en');
            setEmail(data.user.email);
        },
        onError: (data) => {
            const message = isAxiosError(data) ? data.response?.data.message : t('sign_up.failed', { ns: 'glossary' });
            toast.error(message, { closeButton: true });
        },
    });

    const password = form.watch('password');

    React.useEffect(() => {
        if (user) {
            const path: any = redirect || '/console';
            navigate(path).then();
        }
    }, [navigate, redirect, user]);

    const onSubmit = React.useCallback(
        (data: SignUp) => {
            mutate(data);
        },
        [mutate],
    );

    return (
        <div className="relative min-h-dvh bg-gradient-to-b from-background via-background to-muted/30">
            {/* Main */}
            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
                    {/* Copy */}
                    <div className="order-2 md:order-1">
                        <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight">Create your account</h1>
                        <p className="mt-3 text-muted-foreground max-w-prose">
                            Start with the free plan—add employees, track attendance, and evaluate KPIs. Upgrade later
                            for exports and multi-store.
                        </p>

                        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                            <li>• Free to start, no card required</li>
                            <li>• Clean daily workflows (attendance, KPIs, leave input)</li>
                            <li>• Smooth path to Pro when you’re ready</li>
                        </ul>
                    </div>

                    {/* Sign-up card */}
                    <div className="order-1 md:order-2">
                        <Card className="border-primary/20 shadow-sm backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-2xl">Sign up</CardTitle>
                                <CardDescription>Set up your DailyBrew account</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <Form {...form}>
                                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <TextField
                                                control={form.control}
                                                name="firstName"
                                                label={t('first_name')}
                                                placeholder="John"
                                                startIcon={
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                }
                                                disabled={isPending}
                                            />
                                            <TextField
                                                control={form.control}
                                                name="lastName"
                                                label={t('last_name')}
                                                placeholder="Doe"
                                                startIcon={
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                }
                                                disabled={isPending}
                                            />

                                            <TextField
                                                control={form.control}
                                                name="email"
                                                label={t('email')}
                                                placeholder="you@coffee.co"
                                                startIcon={
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                }
                                                disabled={isPending}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="flex flex-col space-y-2 w-full">
                                                <TextField
                                                    control={form.control}
                                                    name="password"
                                                    label={t('password')}
                                                    className="w-full"
                                                    type="password"
                                                    autoComplete="new-password"
                                                    placeholder="••••••••"
                                                    startIcon={
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    }
                                                    disabled={isPending}
                                                />
                                                <PasswordStrength value={password} />
                                            </div>

                                            <TextField
                                                control={form.control}
                                                name="confirmPassword"
                                                label={t('confirm_password')}
                                                className="w-full"
                                                type="password"
                                                placeholder="••••••••"
                                                startIcon={
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                }
                                                disabled={isPending}
                                                autoComplete="new-password"
                                            />
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <CheckboxField
                                                disabled={isPending}
                                                control={form.control}
                                                name="acceptedTerms"
                                                label={
                                                    <React.Fragment>
                                                        I agree to the{' '}
                                                        <Link
                                                            to="/terms"
                                                            className="text-primary underline underline-offset-2"
                                                        >
                                                            Terms
                                                        </Link>{' '}
                                                        and{' '}
                                                        <Link
                                                            to="/privacy"
                                                            className="text-primary underline underline-offset-2"
                                                        >
                                                            Privacy Policy
                                                        </Link>
                                                        .
                                                    </React.Fragment>
                                                }
                                            ></CheckboxField>
                                        </div>

                                        <Button type="submit" className="w-full" disabled={isPending}>
                                            Create account
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </form>
                                </Form>

                                <Separator />

                                {/* Optional SSO placeholders */}
                                {/*<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">*/}
                                {/*    <Button variant="outline" className="w-full">*/}
                                {/*        Continue with Google*/}
                                {/*    </Button>*/}
                                {/*    <Button variant="outline" className="w-full">*/}
                                {/*        Continue with Apple*/}
                                {/*    </Button>*/}
                                {/*</div>*/}

                                <p className="text-xs text-muted-foreground text-center">
                                    Already have an account?{' '}
                                    <Link to="/sign-in" className="text-primary hover:underline underline-offset-2">
                                        Sign in
                                    </Link>
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

/** Simple password strength helper (client-side only) */
function PasswordStrength({ value }: { value?: string }) {
    const score = React.useMemo(() => {
        if (!value) return 0;
        let s = 0;
        if (value.length >= 8) s++;
        if (/[A-Z]/.test(value)) s++;
        if (/[a-z]/.test(value)) s++;
        if (/\d/.test(value)) s++;
        if (/[^A-Za-z0-9]/.test(value)) s++; // symbol bonus
        return Math.min(s, 5);
    }, [value]);

    const labels = ['Very weak', 'Weak', 'Okay', 'Good', 'Strong'];
    const pct = (score / 5) * 100;

    return (
        <div>
            <div className="h-1.5 w-full rounded bg-muted/60 overflow-hidden">
                <div
                    className={cn(
                        'h-full transition-all',
                        score <= 2 && 'bg-destructive',
                        score === 3 && 'bg-yellow-500',
                        score >= 4 && 'bg-green-500',
                    )}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
                {value ? labels[Math.max(0, score - 1)] : 'Use 8+ chars with a mix of letters & numbers'}
            </div>
        </div>
    );
}
