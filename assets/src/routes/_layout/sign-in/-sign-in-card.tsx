import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/field/text-field';
import { SignIn } from '@/types/user';
import { Link } from '@tanstack/react-router';
import { useAuthenticationDispatch } from '@/hooks/use-authentication';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signInSchema } from '@/schema/sign-in-schema';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { signIn } from '@/services/auth';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { ArrowRight, Lock, LockOpen, LogIn, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextSeparator } from '@/components/text-separator';
import { AppleButton } from '@/routes/_layout/-components/apple-button';
import { GoogleButton } from '@/routes/_layout/-components/google-button';

export const SignInCard = () => {
    const { t } = useTranslation();
    const [showPassword, onToggle] = React.useState(false);
    const dispatch = useAuthenticationDispatch();

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
            dispatch({ type: 'SIGN_IN', user: data.user });
        },
        onError: (data) => {
            const message = isAxiosError(data) ? data.response?.data.message : t('sign_in.failed', { ns: 'glossary' });
            toast.error(message, { closeButton: true });
        },
    });

    const onSubmit = React.useCallback(
        (data: SignIn) => {
            mutate(data);
        },
        [mutate],
    );

    return (
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
                            autoComplete="email"
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
                                        onClick={(event) => {
                                            event.preventDefault();
                                            onToggle((prevState) => !prevState);
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                    >
                                        {showPassword ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
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
                                autoComplete="current-password"
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            <LogIn className="mr-2 h-4 w-4" />
                            {t('sign_in')}
                        </Button>
                    </form>
                </Form>

                <TextSeparator>Or continue with</TextSeparator>

                {/* SSO placeholders (optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <AppleButton />
                    <GoogleButton />
                </div>

                <p className="text-xs text-muted-foreground text-center">
                    {t('dont_have_account')}?{' '}
                    <Link to="/sign-up" className="text-primary hover:underline underline-offset-2">
                        {t('create_one_free')}
                        <ArrowRight className="inline h-3.5 w-3.5" />
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
};
