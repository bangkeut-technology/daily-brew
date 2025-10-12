import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';
import { useAuthentication } from '@/hooks/use-authentication';
import { AuthenticationProvider } from '@/providers/authentication-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/i18next';

import './styles/globals.css';
import { LanguageProvider } from '@/providers/language-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { ApplicationProvider } from '@/providers/application-provider';
import { PageNotFound } from '@/components/page-not-found';
import { DemoSessionProvider } from '@/providers/demo-session-provider';

const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    context: {
        authentication: undefined,
    },
    defaultNotFoundComponent: () => <PageNotFound />,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const Application = () => {
    const authentication = useAuthentication();
    return <RouterProvider router={router} context={{ authentication }} />;
};

const queryClient = new QueryClient();

// Render the app
const rootElement = document.querySelector('#daily_brew_application');
if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <ApplicationProvider>
                        <DemoSessionProvider>
                            <AuthenticationProvider>
                                <LanguageProvider>
                                    <Application />
                                </LanguageProvider>
                            </AuthenticationProvider>
                        </DemoSessionProvider>
                    </ApplicationProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </StrictMode>,
    );
}
