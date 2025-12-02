import React from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { PageNotFound } from '@/components/page-not-found';

export const Route = createFileRoute('/console/_authenticated')({
    beforeLoad: ({ context, location }) => {
        if (!context.authentication?.isAuthenticated) {
            throw redirect({
                to: '/sign-in',
                search: {
                    redirect: location.href,
                },
            });
        }
    },
    notFoundComponent: () => <PageNotFound to="/console" />,
});
