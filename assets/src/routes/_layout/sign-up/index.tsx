import * as React from 'react';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { yupResolver } from '@hookform/resolvers/yup';
import { signUpSchema } from '@/schema/sign-up-schema';
import { SignUp } from '@/types/user';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { signUp } from '@/services/auth';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { useAuthentication } from '@/hooks/use-authentication';
import { z } from 'zod';
import { SignUpForm } from '@/routes/_layout/sign-up/-components/sign-up-form';

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
                                <SignUpForm form={form} onSubmit={onSubmit} isPending={isPending} />

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
