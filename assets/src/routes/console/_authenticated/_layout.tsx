import React from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { useBreadcrumb } from '@/hooks/use-breadcrumb';

export const Route = createFileRoute('/console/_authenticated/_layout')({
    component: DashboardLayout,
});

function DashboardLayout() {
    const current = useLocation();
    const { t } = useTranslation();
    const { lastCrumb } = useBreadcrumb();

    const renderBreadcrumbs = React.useCallback(() => {
        const routeHistory = current.pathname.split('/').filter((x) => x && x.length > 0);
        let path = '';
        if (routeHistory.length > 1) {
            return (
                <Breadcrumb className="flex-1">
                    <BreadcrumbList>
                        {routeHistory.map((route, index) => {
                            path += `/${route}`;
                            const isLast = index === routeHistory.length - 1;
                            const name = route.replace('-', ' ');

                            return (
                                <React.Fragment key={route}>
                                    <BreadcrumbItem>
                                        {path === current.pathname ? (
                                            <BreadcrumbPage className="hidden md:block">
                                                {lastCrumb
                                                    ? lastCrumb
                                                    : name === 'new'
                                                      ? t('new.title')
                                                      : t(name as any)}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild className="hidden md:block">
                                                <Link to={path}>{t(route as any)}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </React.Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            );
        }

        return null;
    }, [current.pathname, lastCrumb, t]);

    return (
        <SidebarProvider>
            <AppSidebar />
            <div className="h-full w-full p-2 space-y-2">
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        {renderBreadcrumbs()}
                    </header>

                    <div className="flex flex-1 flex-col gap-4 p-4">
                        <Outlet />
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
