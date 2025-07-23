import React from 'react';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthenticationContextValue } from '@/contexts/authentication-context';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

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
            <footer className="bg-gray-800 text-white py-6">
                <div className="container mx-auto px-6 text-center">
                    <p>&copy; {new Date().getFullYear()} DailyBrew. All rights reserved.</p>
                </div>
            </footer>
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
