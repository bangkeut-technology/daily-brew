import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Coffee, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_layout/forgot-password/')({
    component: ForgotPasswordPage,
});

const schema = z.object({
    email: z.string().email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

function ForgotPasswordPage() {
    const [submitted, setSubmitted] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: '' },
    });

    const onSubmit = async (values: FormValues) => {
        // Call your API endpoint (idempotent)
        // Example:
        // await fetch("/api/auth/forgot-password", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(values),
        // });
        await new Promise((r) => setTimeout(r, 600)); // demo delay
        setSubmitted(true);
        reset({ email: values.email }); // keep email for display if desired
    };

    return (
        <div className="relative min-h-dvh bg-gradient-to-b from-background via-background to-muted/30">
            <Helmet>
                <title>Reset Password — DailyBrew</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            {/* Top bar */}
            <header className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Coffee className="h-4 w-4" />
                    </span>
                    <span className="font-semibold tracking-tight">
                        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            DailyBrew
                        </span>
                        <span className="text-muted-foreground">.work</span>
                    </span>
                </Link>
                <div className="hidden sm:flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm">
                        <Link to="/pricing">Pricing</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                        <Link to="/sign-in">Sign in</Link>
                    </Button>
                </div>
            </header>

            {/* Main */}
            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
                    {/* Copy */}
                    <div className="order-2 md:order-1">
                        <Link
                            to="/sign-in"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to sign in
                        </Link>
                        <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight">Forgot your password?</h1>
                        <p className="mt-3 text-muted-foreground max-w-prose">
                            Enter your email and we’ll send a password reset link if there’s an account associated with
                            it. For security, the message is the same whether or not the email exists.
                        </p>

                        <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                            <li>• Link expires after a short period</li>
                            <li>• You can request a new link anytime</li>
                            <li>• Check spam folder if you don’t see it</li>
                        </ul>
                    </div>

                    {/* Card */}
                    <div className="order-1 md:order-2">
                        <Card className="border-primary/20 shadow-sm backdrop-blur">
                            <CardHeader>
                                <CardTitle className="text-2xl">Reset your password</CardTitle>
                                <CardDescription>We’ll email you a secure reset link</CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {!submitted ? (
                                    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="you@coffee.co"
                                                    className={cn('pl-9', errors.email && 'border-destructive')}
                                                    {...register('email')}
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-xs text-destructive">{errors.email.message}</p>
                                            )}
                                        </div>

                                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                                            Send reset link
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="rounded-md border p-4">
                                            <div className="font-medium">Check your email</div>
                                            <p className="text-sm text-muted-foreground">
                                                If an account exists for that address, you’ll receive a reset link
                                                shortly.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <Button asChild variant="outline" className="w-full">
                                                <Link to="/sign-in">Back to sign in</Link>
                                            </Button>
                                            <Button asChild className="w-full">
                                                <Link to="/sign-up">Create a new account</Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <Separator />

                                <p className="text-xs text-muted-foreground text-center">
                                    Need help?{' '}
                                    <a
                                        href="mailto:support@dailybrew.work"
                                        className="text-primary underline underline-offset-2"
                                    >
                                        support@dailybrew.work
                                    </a>
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
