import React from 'react';
import { createFileRoute, Outlet, redirect, useRouter } from '@tanstack/react-router';
import { useAuthenticationState } from '@/hooks/use-authentication';

export const Route = createFileRoute('/console/_authenticated')({
    component: AuthenticatedLayout,
    beforeLoad: ({ context, location }) => {
        if (context.authentication?.status === 'unauthenticated') {
            throw redirect({ to: '/sign-in', search: { redirect: location.href } });
        }
    },
});

function AuthenticatedLayout() {
    const router = useRouter();
    const auth = useAuthenticationState();

    React.useEffect(() => {
        if (auth.status === 'unauthenticated') {
            router.navigate({
                to: '/sign-in',
                search: { redirect: router.state.location.href },
                replace: true,
            });
        }
    }, [auth.status, router]);

    if (auth.status === 'loading') return null; // or your loader
    return <Outlet />;
}
