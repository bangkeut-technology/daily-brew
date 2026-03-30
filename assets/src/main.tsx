import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

import { routeTree } from './routeTree.gen';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { AuthenticationProvider } from '@/providers/authentication-provider';
import { LanguageProvider } from '@/providers/language-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { ApplicationProvider } from '@/providers/application-provider';

import '@/i18next';
import './styles/globals.css';

import type { AuthenticationState } from '@/contexts/authentication-context';

interface RouterContext {
    authentication: AuthenticationState | undefined;
}

const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    context: { authentication: undefined } as RouterContext,
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const Application = () => {
    const authentication = useAuthenticationState();
    return <RouterProvider router={router} context={{ authentication }} />;
};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
        },
    },
});

const rootElement = document.querySelector('#daily_brew_application');
if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <HelmetProvider>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                        <ApplicationProvider>
                            <AuthenticationProvider>
                                <LanguageProvider>
                                    <Application />
                                    <ThemedToaster />
                                </LanguageProvider>
                            </AuthenticationProvider>
                        </ApplicationProvider>
                    </ThemeProvider>
                </QueryClientProvider>
            </HelmetProvider>
        </StrictMode>,
    );
}

function ThemedToaster() {
    const { resolvedTheme } = useTheme();
    return <Toaster position="top-right" richColors theme={resolvedTheme === 'dark' ? 'dark' : 'light'} />;
}

// Register service worker (production only — sw.js doesn't exist in dev)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}
