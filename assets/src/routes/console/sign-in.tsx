import React from 'react';
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signInSchema } from '@/schema/sign-in-schema';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { SignInType } from '@/types/user';
import { TextField } from '@/components/fields/text-field';
import { Icon } from '@iconify/react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { useAuthentication } from '@/hooks/use-authentication';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBoolean } from 'react-use';
import { signIn } from '@/services/auth';

export const Route = createFileRoute('/console/sign-in')({
    component: SignIn,
    validateSearch: (search) => {
        return {
            redirect: search.redirect || '/console',
        };
    },
    beforeLoad: ({ context, search }) => {
        if (context.authentication?.isAuthenticated) {
            throw redirect({ to: (search.redirect as any) || '/console' });
        }
    },
});

function SignIn() {
    const { t } = useTranslation();
    const [showPassword, onToggle] = useBoolean(false);
    const { redirect } = Route.useSearch();
    const navigate = useNavigate();
    const { user, setEmail } = useAuthentication();
    const form = useForm<SignInType>({
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
            navigate(redirect).then();
        }
    }, [navigate, redirect, user]);

    const onSubmit = (data: SignInType) => {
        mutate(data);
    };

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="flex flex-col gap-6 min-w-[453px]">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{t('sign_in.title', { ns: 'glossary' })}</CardTitle>
                        <CardDescription>{t('sign_in.description', { ns: 'glossary' })}</CardDescription>
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
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    onToggle();
                                                }}
                                            >
                                                <Icon
                                                    icon={showPassword ? 'clarity:eye-solid' : 'clarity:eye-hide-solid'}
                                                />
                                            </Button>
                                        }
                                    />
                                    <Button disabled={isPending} type="submit" className="w-full">
                                        {isPending ? <Icon icon="svg-spinners:blocks-shuffle-3" /> : t('sign_in')}
                                    </Button>
                                </div>
                                <div className="mt-4 text-center text-sm">
                                    {t('no_account_yet', { ns: 'glossary' })}&nbsp;
                                    <Link
                                        to="/console/sign-up"
                                        search={{
                                            redirect: '/console',
                                        }}
                                        className="underline underline-offset-4"
                                    >
                                        {t('sign_up')}
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
