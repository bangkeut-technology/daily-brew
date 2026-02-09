import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { IdentityCard } from '@/routes/console/_authenticated/_layout/profile/_layout/-features/identity-card';
import { PreferencesCard } from '@/routes/console/_authenticated/_layout/profile/_layout/-features/preference-card';
import { AdvancedCard } from '@/routes/console/_authenticated/_layout/profile/_layout/-features/advanced-card';

export const Route = createFileRoute('/console/_authenticated/_layout/profile/_layout/')({
    component: ProfileOverview,
});

function ProfileOverview() {
    const { user } = useAuthenticationState();
    if (!user) return null;

    return (
        <React.Fragment>
            <IdentityCard user={user} />
            <PreferencesCard user={user} />
            <AdvancedCard user={user} />
        </React.Fragment>
    );
}
