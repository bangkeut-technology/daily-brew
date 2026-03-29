import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuthentication } from '@/hooks/use-authentication';

export const Route = createFileRoute('/auth/callback/')({
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

        navigate({ to: '/console' });
    }, [status, user, navigate]);

    return null;
}
