import React from 'react';
import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { TabNav } from '@/components/tab-nav';

export const Route = createFileRoute('/console/_authenticated/_layout/profile/_layout')({
    component: Layout,
});

function Layout() {
    const { t } = useTranslation();
    const { pathname: currentPathname } = useLocation();

    const tabs = React.useMemo(() => {
        return [
            {
                label: t('profile'),
                path: '/console/profile',
                pathname: '/console/profile',
            },
            {
                label: t('connections'),
                path: '/console/profile/connections',
                pathname: '/console/profile',
            },
            {
                label: t('security'),
                path: '/console/profile/security',
                pathname: '/console/profile/security',
            },
        ];
    }, [t]);

    return (
        <div className="space-y-2 py-4">
            <div>
                <h1 className="text-2xl font-semibold">{t('profile')}</h1>
                <p className="text-sm text-muted-foreground">
                    {t('profile.subtitle', {
                        defaultValue: 'Manage your account information and security',
                    })}
                </p>
            </div>

            <TabNav navItems={tabs} currentPathname={currentPathname} />

            <Outlet />
        </div>
    );
}
