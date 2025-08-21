import { createFileRoute, Outlet } from '@tanstack/react-router';
import { SiteHeader } from '@/components/site-header';
import React from 'react';
import { SiteFooter } from '@/components/site-footer';

export const Route = createFileRoute('/_layout')({
    component: Layout,
});

function Layout() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <SiteHeader />
            <Outlet />
            <SiteFooter />
        </div>
    );
}
