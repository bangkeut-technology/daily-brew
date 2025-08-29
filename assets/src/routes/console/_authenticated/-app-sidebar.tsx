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
import {
    BarChart3,
    Briefcase,
    CalendarClock,
    CalendarDays,
    ChevronRight,
    ChevronUp,
    ClipboardList,
    ClockPlus,
    CreditCard,
    FileClock,
    Gauge,
    LayoutDashboard,
    ListTodo,
    LogOut,
    SettingsIcon,
    User2,
    Users,
} from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthentication } from '@/hooks/use-authentication';
import { useTranslation } from 'react-i18next';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';

type SidebarMenuItem = {
    title: string;
    url?: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    children?: SidebarMenuItem[];
    pro?: boolean;
};

export const AppSidebar = () => {
    const { user } = useAuthentication();
    const { t } = useTranslation();
    const { pathname } = useLocation();

    const items = React.useMemo<SidebarMenuItem[]>(
        () => [
            { title: t('dashboard'), url: '/console', icon: LayoutDashboard },
            { title: t('employees'), url: '/console/employees', icon: Users },
            {
                title: t('performance'),
                icon: BarChart3,
                children: [
                    { title: t('kpi'), url: '/console/performance/kpi', icon: BarChart3 },
                    { title: t('attendance'), url: '/console/performance/attendances', icon: CalendarDays },
                ],
            },
            {
                title: t('evaluations'),
                icon: ListTodo,
                children: [
                    { title: t('evaluate'), url: '/console/evaluations/evaluate', icon: Gauge },
                    { title: t('history'), url: '/console/evaluations/histories', icon: ClipboardList },
                ],
            },
            {
                title: t('attendances'),
                icon: CalendarClock,
                children: [
                    { title: t('new'), url: '/console/attendances/new', icon: ClockPlus },
                    { title: t('history'), url: '/console/attendances/histories', icon: FileClock },
                ],
            },
            {
                title: t('manage'),
                icon: Briefcase,
                children: [
                    { title: t('templates'), url: '/console/manage/templates', icon: ListTodo },
                    { title: t('criterias'), url: '/console/manage/criterias', icon: ClipboardList },
                    { title: t('roles'), url: '/console/manage/roles', icon: Briefcase },
                ],
            },
            { title: t('billing'), url: '/console/billing', icon: CreditCard, pro: true },
            { title: t('settings'), url: '/console/settings', icon: SettingsIcon },
        ],
        [t],
    );

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
