// routes/sign-up.tsx
import * as React from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Coffee, Mail, Lock, User, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_layout/sign-up/')({
    component: SignUpPage,
});

const passwordSchema = z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[a-z]/, 'Include at least one lowercase letter')
    .regex(/\d/, 'Include at least one number');

const schema = z
    .object({
        firstName: z.string().min(1, 'Required'),
        lastName: z.string().min(1, 'Required'),
        email: z.string().email('Enter a valid email'),
        password: passwordSchema,
        confirmPassword: z.string(),
        accept: z.boolean().refine((v) => v, 'Please accept Terms & Privacy'),
    })
    .refine((vals) => vals.password === vals.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    });

type FormValues = z.infer<typeof schema>;

function SignUpPage() {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            accept: false,
        },
    });

    const password = watch('password');

    const onSubmit = async (values: FormValues) => {
        await new Promise((r) => setTimeout(r, 600)); // demo delay
        navigate({ to: '/sign-in' });
    };

    return (
        <div className="relative min-h-dvh bg-gradient-to-b from-background via-background to-muted/30">
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
                                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="firstName"
                                                    placeholder="Sovan"
                                                    className={cn('pl-9', errors.firstName && 'border-destructive')}
                                                    {...register('firstName')}
                                                />
                                            </div>
                                            {errors.firstName && (
                                                <p className="text-xs text-destructive">{errors.firstName.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="lastName"
                                                    placeholder="Chanthy"
                                                    className={cn('pl-9', errors.lastName && 'border-destructive')}
                                                    {...register('lastName')}
                                                />
                                            </div>
                                            {errors.lastName && (
                                                <p className="text-xs text-destructive">{errors.lastName.message}</p>
                                            )}
                                        </div>
                                    </div>

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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className={cn('pl-9', errors.password && 'border-destructive')}
                                                    {...register('password')}
                                                />
                                            </div>
                                            {errors.password ? (
                                                <p className="text-xs text-destructive">{errors.password.message}</p>
                                            ) : (
                                                <PasswordStrength value={password} />
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    className={cn(
                                                        'pl-9',
                                                        errors.confirmPassword && 'border-destructive',
                                                    )}
                                                    {...register('confirmPassword')}
                                                />
                                            </div>
                                            {errors.confirmPassword && (
                                                <p className="text-xs text-destructive">
                                                    {errors.confirmPassword.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Checkbox id="accept" {...register('accept')} />
                                        <Label htmlFor="accept" className="text-xs text-muted-foreground">
                                            I agree to the{' '}
                                            <Link to="/terms" className="text-primary underline underline-offset-2">
                                                Terms
                                            </Link>{' '}
                                            and{' '}
                                            <Link to="/privacy" className="text-primary underline underline-offset-2">
                                                Privacy Policy
                                            </Link>
                                            .
                                        </Label>
                                    </div>
                                    {errors.accept && (
                                        <p className="text-xs text-destructive">{errors.accept.message}</p>
                                    )}

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        Create account
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>

                                <Separator />

                                {/* Optional SSO placeholders */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <Button variant="outline" className="w-full">
                                        Continue with Google
                                    </Button>
                                    <Button variant="outline" className="w-full">
                                        Continue with Apple
                                    </Button>
                                </div>

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
