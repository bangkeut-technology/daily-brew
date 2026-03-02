import React from 'react';
import {
    Sidebar,
    SidebarContent,
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
    useSidebar,
} from '@/components/ui/sidebar';
import {
    Briefcase,
    CalendarClock,
    CalendarRange,
    ChevronRight,
    CircleUser,
    ClipboardList,
    CreditCard,
    EllipsisVertical,
    Gauge,
    LayoutDashboard,
    ListTodo,
    LogOut,
    SettingsIcon,
    UserPlus,
    Users,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthenticationDispatch, useAuthenticationState } from '@/hooks/use-authentication';
import { useTranslation } from 'react-i18next';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, getUserFullName } from '@/lib/string';
import { DemoPill } from '@/routes/console/_authenticated/-components/demo-pill';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signOut } from '@/services/auth';
import { toast } from 'sonner';
import { Logo } from '@/components/logo';
import { WorkspaceSwitcher } from '@/routes/console/_authenticated/-components/workspace-switcher';

type NavItem = {
    key: string;
    title?: string;
    url?: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    children?: NavItem[];
    pro?: boolean;
};

const NAV_ITEMS: NavItem[] = [
    { key: 'dashboard', url: '/console', icon: LayoutDashboard },
    { key: 'employees', url: '/console/employees', icon: Users },
    {
        key: 'evaluations',
        icon: ListTodo,
        children: [
            { key: 'evaluate', url: '/console/evaluations/evaluate', icon: Gauge },
            { key: 'history', url: '/console/evaluations/histories', icon: ClipboardList },
        ],
    },
    {
        key: 'attendances',
        icon: CalendarClock,
        url: '/console/attendances',
    },
    {
        key: 'attendance_batches',
        icon: CalendarRange,
        url: '/console/attendance-batches',
    },
    {
        key: 'manage',
        icon: Briefcase,
        children: [
            { key: 'templates', url: '/console/manage/templates', icon: ListTodo },
            { key: 'criterias', url: '/console/manage/criterias', icon: ClipboardList },
            { key: 'roles', url: '/console/manage/roles', icon: Briefcase },
            { key: 'members', url: '/console/manage/members', icon: UserPlus },
        ],
    },
    { key: 'billing', url: '/console/billing', icon: CreditCard, pro: true },
    { key: 'settings', url: '/console/settings', icon: SettingsIcon },
];

export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
    const { user, demo } = useAuthenticationState();
    const dispatch = useAuthenticationDispatch();
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { isMobile } = useSidebar();
    const queryClient = useQueryClient();
    const { mutate } = useMutation({
        mutationFn: signOut,
        onSuccess: () => {
            navigate({ to: '/sign-in' });
            toast.success('Signed out successfully');
            dispatch({ type: 'SIGN_OUT' });
            queryClient.clear();
        },
    });

    const isActive = React.useCallback(
        (url?: string) => {
            if (!url) return false;

            const current = pathname.replace(/\/+$/, '');
            const target = url.replace(/\/+$/, '');

            if (current === target) return true;

            return target !== '/console' && current.startsWith(target + '/');
        },
        [pathname],
    );

    const renderMenuSub = React.useCallback(
        (items: NavItem[]) =>
            items.map((item) => {
                const Icon = item.icon;
                return (
                    <SidebarMenuSubItem key={item.key}>
                        <SidebarMenuSubButton asChild isActive={isActive(item.url)}>
                            <Link to={item.url ?? '/console'}>
                                <Icon className="h-4 w-4" />
                                <span>{item.title ?? t(item.key as any)}</span>
                            </Link>
                        </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                );
            }),
        [isActive, t],
    );

    const renderMenu = React.useCallback(
        (items: NavItem[]) =>
            items.map((item) => {
                const Icon = item.icon;

                if (item.children && item.children.length > 0) {
                    const openByDefault = item.children.some((child) => isActive(child.url));

                    return (
                        <Collapsible key={item.key} defaultOpen={openByDefault} className="group/collapsible">
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton isActive={openByDefault}>
                                    <Icon className="h-4 w-4" />
                                    <span>{item.title ?? t(item.key as any)}</span>
                                    <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>{renderMenuSub(item.children)}</SidebarMenuSub>
                            </CollapsibleContent>
                        </Collapsible>
                    );
                }

                return (
                    <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                            <Link to={item.url ?? '/console'}>
                                <Icon className="h-4 w-4" />
                                <span>{item.title ?? t(item.key as any)}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            }),
        [isActive, renderMenuSub, t],
    );

    const signOuFunc = React.useCallback(() => {
        mutate();
    }, [mutate]);

    const userEmail = user?.email ?? t('unknown_user');
    const userInitial = getInitials(user?.fullName);

    return (
        <Sidebar collapsible="icon" {...props}>
            {/* HEADER */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            asChild
                        >
                            <Logo to="/console" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {demo && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                asChild
                            >
                                <DemoPill />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            asChild
                        >
                            <WorkspaceSwitcher />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* CONTENT */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('application')}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>{renderMenu(NAV_ITEMS)}</SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* FOOTER / USER MENU */}
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <Avatar className="h-8 w-8 rounded-lg grayscale">
                                    <AvatarImage src={user?.avatarUrl} alt={userEmail} />
                                    <AvatarFallback className="rounded-lg">{userInitial}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user ? getUserFullName(user) : t('unknown_user')}
                                    </span>
                                    <span className="text-muted-foreground truncate text-xs">{userEmail}</span>
                                </div>
                                <EllipsisVertical className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={isMobile ? 'bottom' : 'right'}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg grayscale">
                                        <AvatarImage src={user?.avatarUrl} alt={userEmail} />
                                        <AvatarFallback className="rounded-lg">{userInitial}</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">
                                            {user ? getUserFullName(user) : t('unknown_user')}
                                        </span>
                                        <span className="text-muted-foreground truncate text-xs">{userEmail}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <CircleUser />
                                    {t('account')}
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOuFunc}>
                                <LogOut />
                                {t('sign_out')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </Sidebar>
    );
};

AppSidebar.displayName = 'AppSidebar';
