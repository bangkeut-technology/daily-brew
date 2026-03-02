import React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/callback/')({
    component: AuthCallbackPage,
});

function AuthCallbackPage() {
    const navigate = useNavigate();

    React.useEffect(() => {
        navigate({ to: '/console' });
    }, [navigate]);

    return null;
}
