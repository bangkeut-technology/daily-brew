import React from 'react';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { Helmet } from 'react-helmet-async';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { z } from 'zod';
import { WelcomeSection } from '@/routes/_layout/sign-in/-welcome-section';
import { SignInCard } from '@/routes/_layout/sign-in/-sign-in-card';

export const Route = createFileRoute('/_layout/sign-in/')({
    component: SignInComponent,
    validateSearch: z.object({
        redirect: z.string().optional().default('/console'),
    }),
    beforeLoad: ({ context, search }) => {
        if (context.authentication?.status === 'authenticated') {
            throw redirect({ to: (search.redirect as any) || '/console' });
        }
    },
});

function SignInComponent() {
    const { redirect } = Route.useSearch();
    const navigate = useNavigate();
    const { user } = useAuthenticationState();

    React.useEffect(() => {
        if (user) {
            const path: any = redirect || '/console';
            navigate(path).then();
        }
    }, [navigate, redirect, user]);

    return (
        <div className="relative min-h-dvh bg-linear-to-b from-background via-background to-muted/30">
            <Helmet>
                <title>Sign In — DailyBrew</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            {/* Main */}
            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center">
                    {/* Brand / copy */}
                    <WelcomeSection />
                    {/* Auth card */}
                    <div className="order-1 md:order-2">
                        <SignInCard />
                    </div>
                </div>
            </main>
        </div>
    );
}
