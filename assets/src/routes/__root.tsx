import React from 'react';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthenticationContextValue } from '@/contexts/authentication-context';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SiteFooter } from '@/components/site-footer';

const TanStackRouterDevtools =
    process.env.NODE_ENV === 'production'
        ? () => null
        : React.lazy(() =>
              import('@tanstack/react-router-devtools').then((res) => ({
                  default: res.TanStackRouterDevtools,
              })),
          );

export const Route = createRootRouteWithContext<{ authentication: AuthenticationContextValue | undefined }>()({
    component: () => (
        <TooltipProvider>
            <Outlet />
            <SiteFooter />
            <Toaster
                position="top-right"
                richColors
                toastOptions={{
                    closeButton: true,
                }}
            />
            <TanStackRouterDevtools position="top-right" />
            <ReactQueryDevtools position="bottom" initialIsOpen={false} />
        </TooltipProvider>
    ),
});
