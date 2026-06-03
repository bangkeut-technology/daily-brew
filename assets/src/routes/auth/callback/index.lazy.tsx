import { useEffect } from 'react';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuthentication } from '@/hooks/use-authentication';

export const Route = createLazyFileRoute('/auth/callback/')({
    component: AuthCallbackPage,
});

function AuthCallbackPage() {
    const navigate = useNavigate();
    const { status, user } = useAuthentication();

    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            navigate({ to: '/sign-in' });
            return;
        }

        if (user && !user.onboardingCompleted) {
            navigate({ to: '/onboarding' });
            return;
        }

        navigate({ to: '/console/dashboard' });
    }, [status, user, navigate]);

    return null;
}
