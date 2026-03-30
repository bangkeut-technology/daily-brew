import React, { useMemo, type ReactNode } from 'react';
import { ApplicationContext, type ApplicationConfig } from '@/contexts/application-context';

declare global {
    interface Window {
        __DAILYBREW__?: {
            user?: unknown;
            maxFreeEmployees?: number;
            contactEmail?: string;
            googleClientId?: string;
            appleClientId?: string;
            paddleEnvironment?: string;
            paddleClientSideToken?: string;
            paddlePriceIdMonthly?: string;
            paddlePriceIdAnnual?: string;
        };
        Paddle?: {
            Initialize: (opts: { token: string; eventCallback?: (event: { name: string; data?: Record<string, unknown> }) => void }) => void;
            Checkout: {
                open: (opts: Record<string, unknown>) => void;
            };
        };
    }
}

interface Props {
    children: ReactNode;
}

export function ApplicationProvider({ children }: Props) {
    const config = useMemo<ApplicationConfig>(() => {
        let data: Record<string, unknown> | undefined;
        try {
            const raw = sessionStorage.getItem('application');
            if (raw) data = JSON.parse(raw);
        } catch { /* ignore */ }
        data ??= window.__DAILYBREW__;
        return {
            maxFreeEmployees: (data?.maxFreeEmployees as number) ?? 5,
            contactEmail: (data?.contactEmail as string) ?? 'support@dailybrew.work',
            googleClientId: (data?.googleClientId as string) ?? '',
            appleClientId: (data?.appleClientId as string) ?? '',
        };
    }, []);

    return (
        <ApplicationContext.Provider value={config}>
            {children}
        </ApplicationContext.Provider>
    );
}
