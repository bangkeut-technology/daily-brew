import React from 'react';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { SignUp } from '@/types/user';
import { TextField } from '@/components/field/text-field';
import { Icon } from '@iconify/react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { useAuthentication } from '@/hooks/use-authentication';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBoolean } from 'react-use';
import { signUpSchema } from '@/schema/sign-up-schema';
import { signUp } from '@/services/auth';
import { z } from 'zod';

export const Route = createFileRoute('/_layout/sign-up/')({
    component: SignUpComponent,
    validateSearch: z.object({
        redirect: z.string().optional().default('/console'),
    }),
    beforeLoad: ({ context, search }) => {
        if (context.authentication?.isAuthenticated) {
            throw redirect({ to: (search.redirect as any) || '/console' });
        }
    },
});

function SignUpComponent() {
    const { t } = useTranslation();
    const [showPassword, onToggle] = useBoolean(false);
    const [showConfirmPassword, onShowConfirmPassword] = useBoolean(false);
    const { redirect } = Route.useSearch();
    const navigate = useNavigate();
    const { user, setEmail } = useAuthentication();
    const form = useForm<SignUp>({
        resolver: yupResolver(signUpSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: '',
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

    const onSubmit = (data: SignUp) => {
        mutate(data);
    };

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="flex flex-col gap-6 min-w-[453px]">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{t('sign_up.title', { ns: 'glossary' })}</CardTitle>
                        <CardDescription>{t('sign_up.description', { ns: 'glossary' })}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
                                <div className="space-y-4">
                                    <TextField
                                        control={form.control}
                                        name="email"
                                        label={t('email')}
                                        autoComplete="email"
                                    />
                                    <TextField
                                        control={form.control}
                                        name="password"
                                        label={t('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        endIcon={
                                            <Button variant="outline" size="icon" type="button" onClick={onToggle}>
                                                <Icon
                                                    icon={showPassword ? 'clarity:eye-solid' : 'clarity:eye-hide-solid'}
                                                />
                                            </Button>
                                        }
                                    />
                                    <TextField
                                        control={form.control}
                                        name="confirmPassword"
                                        label={t('confirm_password')}
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        endIcon={
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                type="button"
                                                onClick={onShowConfirmPassword}
                                            >
                                                <Icon
                                                    icon={
                                                        showConfirmPassword
                                                            ? 'clarity:eye-solid'
                                                            : 'clarity:eye-hide-solid'
                                                    }
                                                />
                                            </Button>
                                        }
                                    />
                                    <TextField
                                        control={form.control}
                                        name="firstName"
                                        label={t('first_name')}
                                        autoComplete="given-name"
                                    />
                                    <TextField
                                        control={form.control}
                                        name="lastName"
                                        label={t('last_name')}
                                        autoComplete="family-name"
                                    />
                                    <Button disabled={isPending} type="submit" className="w-full">
                                        {isPending ? <Icon icon="svg-spinners:blocks-shuffle-3" /> : t('sign_up')}
                                    </Button>
                                </div>
                                <div className="mt-4 text-center text-sm">
                                    {t('have_account', { ns: 'glossary' })}&nbsp;
                                    <Link
                                        to="/sign-in"
                                        search={{
                                            redirect: '/console',
                                        }}
                                        className="underline underline-offset-4"
                                    >
                                        {t('sign_in')}
                                    </Link>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
