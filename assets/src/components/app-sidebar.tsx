import React from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { ChevronRight, ChevronUp, ClipboardList, LayoutDashboard, ListTodo, LogOut, User2 } from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthentication } from '@/hooks/use-authentication';
import i18next from '@/i18next';
import { useTranslation } from 'react-i18next';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';

type SidebarMenuItem = {
    title: string;
    url?: string;
    icon: React.FC;
    children?: SidebarMenuItem[];
};

const items: SidebarMenuItem[] = [
    {
        title: i18next.t('dashboard'),
        url: '/console',
        icon: LayoutDashboard,
    },
    {
        title: i18next.t('employees'),
        url: '/console/employees',
        icon: User2,
    },
    {
        title: i18next.t('evaluations'),
        icon: ListTodo,
        children: [
            {
                title: i18next.t('templates'),
                url: '/console/evaluations/templates',
                icon: ListTodo,
            },
            {
                title: i18next.t('criterias'),
                url: '/console/evaluations/criterias',
                icon: ClipboardList,
            },
        ],
    },
];

export const AppSidebar = () => {
    const { user } = useAuthentication();
    const { t } = useTranslation();
    const { pathname } = useLocation();

    const renderMenuSub = React.useCallback(
        (items: SidebarMenuItem[]) => {
            return items.map((item) => {
                const Icon = item.icon;
                return (
                    <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={pathname === item.url}>
                            <Link to={item.url}>
                                <Icon />
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                );
            });
        },
        [pathname],
    );

    const renderMenu = React.useCallback(
        (items: SidebarMenuItem[]) =>
            items.map((item) => {
                const Icon = item.icon;
                if (item.children && item.children.length > 0) {
                    return (
                        <Collapsible defaultOpen className="group/collapsible" key={item.title}>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton>
                                    <Icon />
                                    <span>{item.title}</span>
                                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>{renderMenuSub(item.children)}</SidebarMenuSub>
                            </CollapsibleContent>
                        </Collapsible>
                    );
                }
                return (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={pathname === item.url}>
                            <Link to={item.url}>
                                <Icon />
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            }),
        [pathname, renderMenuSub],
    );

    return (
        <Sidebar>
            <SidebarHeader>
                <h1 className="text-2xl font-bold">DailyBrew</h1>
                <p className="text-sm text-gray-500">{t('admin_console')}</p>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>{t('application')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>{renderMenu(items)}</SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <User2 /> {user?.email}
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                                <DropdownMenuItem>
                                    <a
                                        href="/console/logout"
                                        className="text-red-500 w-full flex flex-row space-x-2 items-center"
                                    >
                                        <LogOut className="text-red-500" />
                                        <span>{t('sign_out')}</span>
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};
