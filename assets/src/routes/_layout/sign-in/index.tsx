import React from 'react';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signInSchema } from '@/schema/sign-in-schema';
import { Button } from '@/components/ui/button';
import { SignIn } from '@/types/user';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { useAuthentication } from '@/hooks/use-authentication';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBoolean } from 'react-use';
import { signIn } from '@/services/auth';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Coffee, Lock, LockOpen, LogIn, Mail } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/field/text-field';

export const Route = createFileRoute('/_layout/sign-in/')({
    component: SignInComponent,
    validateSearch: z.object({
        redirect: z.string().optional().default('/console'),
    }),
    beforeLoad: ({ context, search }) => {
        if (context.authentication?.isAuthenticated) {
            throw redirect({ to: (search.redirect as any) || '/console' });
        }
    },
});

function SignInComponent() {
    const { t } = useTranslation();
    const [rememberMe, setRememberMe] = React.useState(false);
    const [showPassword, onToggle] = useBoolean(false);
    const { redirect } = Route.useSearch();
    const navigate = useNavigate();
    const { user, setEmail } = useAuthentication();
    const form = useForm<SignIn>({
        resolver: yupResolver(signInSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });
    const { isPending, mutate } = useMutation({
        mutationFn: signIn,
        onSuccess: (data) => {
            sessionStorage.setItem('email', data.user.email);
            sessionStorage.setItem('locale', data.user.locale || 'en');
            setEmail(data.user.email);
        },
        onError: (data) => {
            const message = isAxiosError(data) ? data.response?.data.message : t('sign_in.failed', { ns: 'glossary' });
            toast.error(message, { closeButton: true });
        },
    });

    React.useEffect(() => {
        if (user) {
            const path: any = redirect || '/console';
            navigate(path).then();
        }
    }, [navigate, redirect, user]);

    const onSubmit = React.useCallback(
        (data: SignIn) => {
            mutate({ ...data, remember_me: rememberMe });
        },
        [mutate, rememberMe],
    );

    return (
        <div className="relative min-h-dvh bg-gradient-to-b from-background via-background to-muted/30">
            {/* Main */}
            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
                    {/* Brand / copy */}
                    <div className="order-2 md:order-1">
                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                            <Coffee className="h-3.5 w-3.5" />
                            Brewed for cafés & small teams
                        </div>
                        <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight">
                            Welcome back to
                            <span className="text-primary"> DailyBrew</span>
                        </h1>
                        <p className="mt-3 text-muted-foreground max-w-prose">
                            Track attendance, evaluate KPIs, and prep payroll — without the clutter. Sign in to continue
                            where you left off.
                        </p>

                        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                            <li>• Quick daily inputs with a clean Gantt view</li>
                            <li>• Weighted KPI templates & history snapshots</li>
                            <li>• Free to start, simple upgrade path</li>
                        </ul>
                    </div>

                    {/* Auth card */}
                    <div className="order-1 md:order-2">
                        <Card className="border-primary/20 shadow-sm backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-2xl">Sign in</CardTitle>
                                <CardDescription>Use your email to access the console</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <Form {...form}>
                                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                                        <TextField
                                            control={form.control}
                                            name="email"
                                            label={t('email')}
                                            placeholder="your@coffee.co"
                                            startIcon={
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            }
                                            required
                                            disabled={isPending}
                                        />

                                        <div className="space-y-2">
                                            <TextField
                                                control={form.control}
                                                name="password"
                                                placeholder="••••••••"
                                                label={t('password')}
                                                type={showPassword ? 'text' : 'password'}
                                                disabled={isPending}
                                                endIcon={
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        type="button"
                                                        onClick={onToggle}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                                    >
                                                        {showPassword ? (
                                                            <Lock className="h-4 w-4" />
                                                        ) : (
                                                            <LockOpen className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                }
                                                labelRight={
                                                    <Link
                                                        to="/forgot-password"
                                                        className="text-xs text-primary hover:underline underline-offset-2"
                                                    >
                                                        {t('forgot')}?
                                                    </Link>
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="remember"
                                                checked={rememberMe}
                                                onCheckedChange={() => setRememberMe((prevState) => !prevState)}
                                            />
                                            <Label htmlFor="remember" className="text-xs text-muted-foreground">
                                                {t('remember_me')}
                                            </Label>
                                        </div>

                                        <Button type="submit" className="w-full">
                                            <LogIn className="mr-2 h-4 w-4" />
                                            {t('sign_in')}
                                        </Button>
                                    </form>
                                </Form>

                                <Separator />

                                {/* SSO placeholders (optional) */}
                                {/*<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">*/}
                                {/*    <Button variant="outline" className="w-full">*/}
                                {/*        Continue with Google*/}
                                {/*    </Button>*/}
                                {/*    <Button variant="outline" className="w-full">*/}
                                {/*        Continue with Apple*/}
                                {/*    </Button>*/}
                                {/*</div>*/}

                                <p className="text-xs text-muted-foreground text-center">
                                    {t('dont_have_account')}?{' '}
                                    <Link to="/sign-up" className="text-primary hover:underline underline-offset-2">
                                        {t('create_one_free')}
                                        <ArrowRight className="inline h-3.5 w-3.5" />
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
