import React from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import { Separator } from '@/components/ui/separator';
import { BackButton } from '@/components/button/back-button';
import { AppSidebar } from '@/routes/console/_authenticated/-app-sidebar';

export const Route = createFileRoute('/console/_authenticated/_layout')({
    component: DashboardLayout,
});

function DashboardLayout() {
    const current = useLocation();

    const renderBackButton = React.useCallback(() => {
        const routeHistory = current.pathname.split('/').filter((x) => x && x.length > 0);
        if (routeHistory.length > 2) {
            return <BackButton />;
        }

        return null;
    }, [current.pathname]);

    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="h-full w-full p-2 space-y-2">
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        {renderBackButton()}
                    </header>

                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <Outlet />
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
