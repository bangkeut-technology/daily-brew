import { Link, useLocation } from '@tanstack/react-router';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    FileText,
    Clock,
    CalendarOff,
    Settings,
    Crown,
    QrCode,
    HelpCircle,
    X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlan } from '@/hooks/queries/usePlan';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { getWorkspacePublicId } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { ManagerPermission } from "@/types";

interface NavItemDef {
    to: string;
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    espresso?: boolean;
    badge?: number;
    tourId?: string;
}

const ownerMainNav: NavItemDef[] = [
    { to: '/console/dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
    { to: '/console/employees', icon: Users, label: 'nav.employees', tourId: 'nav-employees' },
    { to: '/console/attendance', icon: CalendarCheck, label: 'nav.attendance', tourId: 'nav-attendance' },
    { to: '/console/leave', icon: FileText, label: 'nav.leaveRequests', espresso: true },
];

const ownerManageNav: NavItemDef[] = [
    { to: '/console/shifts', icon: Clock, label: 'nav.shifts', tourId: 'nav-shifts' },
    { to: '/console/closures', icon: CalendarOff, label: 'nav.closures' },
    { to: '/console/settings', icon: Settings, label: 'nav.settings', tourId: 'nav-settings' },
];

/**
 * Build the manager-view nav set from a manager's granular permissions.
 * Dashboard + Attendance are always visible (employees see their own attendance
 * even without manage_attendance; a manager is still an employee in that
 * respect). The rest of the items map 1:1 to a ManagerPermissionEnum case so
 * a manager who hasn't been granted `manage_shifts` won't see Shifts in the
 * sidebar at all.
 *
 * Sub-QR codes and workspace settings stay owner-only and are intentionally
 * omitted here even for a manager with every permission.
 */
function buildManagerNav(permissions: ManagerPermission[]): NavItemDef[] {
    const has = (p: ManagerPermission) => permissions.includes(p);
    const items: NavItemDef[] = [
        { to: '/console/dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
        { to: '/console/attendance', icon: CalendarCheck, label: 'nav.attendance' },
        { to: '/console/leave', icon: FileText, label: 'nav.leaveRequests', espresso: true },
    ];
    if (has('manage_employees')) {
        items.push({ to: '/console/employees', icon: Users, label: 'nav.employees' });
    }
    if (has('manage_shifts')) {
        items.push({ to: '/console/shifts', icon: Clock, label: 'nav.shifts' });
    }
    if (has('manage_closures')) {
        items.push({ to: '/console/closures', icon: CalendarOff, label: 'nav.closures' });
    }
    return items;
}

const employeeMainNav: NavItemDef[] = [
    { to: '/console/dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
    { to: '/console/attendance', icon: CalendarCheck, label: 'nav.myAttendance' },
    { to: '/console/leave', icon: FileText, label: 'nav.myLeaveRequests' },
];

function NavItem({
    to,
    icon: Icon,
    label,
    espresso,
    canUseLeaveRequests,
    badge,
    planBadge,
    tourId,
    disabled,
}: {
    to: string;
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    espresso?: boolean;
    canUseLeaveRequests?: boolean;
    badge?: number;
    planBadge?: React.ReactNode;
    tourId?: string;
    disabled?: boolean;
}) {
    const { t } = useTranslation();
    const location = useLocation();
    const active = !disabled && (location.pathname === to || location.pathname.startsWith(to + '/'));

    if (disabled) {
        return (
            <div
                {...(tourId ? { 'data-tour': tourId } : {})}
                className="relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-px font-sans text-[15.5px] text-text-tertiary/50 border border-transparent cursor-not-allowed select-none"
            >
                <Icon size={16} />
                <span className="flex-1">{t(label)}</span>
            </div>
        );
    }

    return (
        <Link
            to={to}
            {...(tourId ? { 'data-tour': tourId } : {})}
            className={cn(
                'relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer mb-px font-sans text-[15.5px] transition-all duration-180 no-underline',
                active
                    ? 'bg-glass-bg backdrop-blur-sm text-coffee font-medium border border-glass-border shadow-sm'
                    : 'text-text-secondary hover:bg-cream-3 hover:text-text-primary border border-transparent',
            )}
        >
            <Icon size={16} />
            <span className="flex-1 flex items-center gap-1.5">
                {t(label)}
                {planBadge}
            </span>
            {espresso && !canUseLeaveRequests && (
                <span className="ml-auto flex items-center gap-1 text-[12px] font-semibold text-amber">
                    <Crown size={12} className="opacity-60" />
                    <span>Espresso</span>
                </span>
            )}
            {badge != null && badge > 0 && (
                <span className="ml-auto bg-amber text-white text-[12px] font-semibold px-1.5 py-px rounded-full leading-normal">
                    {badge}
                </span>
            )}
            <span
                className={cn(
                    'absolute right-2.5 w-1 h-1 rounded-full bg-amber transition-opacity',
                    active ? 'opacity-100' : 'opacity-0',
                )}
            />
        </Link>
    );
}

function NavSection({ items, canUseLeaveRequests, disabled }: { items: NavItemDef[]; canUseLeaveRequests?: boolean; disabled?: boolean }) {
    return (
        <div className="space-y-0.5">
            {items.map((item) => (
                <NavItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    espresso={item.espresso}
                    canUseLeaveRequests={canUseLeaveRequests}
                    badge={item.badge}
                    tourId={item.tourId}
                    disabled={disabled}
                />
            ))}
        </div>
    );
}

function Divider() {
    return <div className="my-3 border-t border-cream-3" />;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: { mobileOpen?: boolean; onMobileClose?: () => void } = {}) {
    const { t } = useTranslation();
    const workspacePublicId = getWorkspacePublicId() ?? '';
    const { data: plan } = usePlan(workspacePublicId);
    const { data: roleContext } = useRoleContext();

    const isOwner = roleContext?.isOwner ?? false;
    const isEmployee = roleContext?.isEmployee ?? false;
    const isManager = roleContext?.isManager ?? false;
    const roleLoaded = !!roleContext;
    // Show owner nav if owner of current workspace, or if no role loaded yet (loading state)
    const showOwnerView = !roleLoaded || isOwner;
    // Show manager nav when employee is manager and NOT owner
    const showManagerView = roleLoaded && isManager && !isOwner;
    // Show employee nav only when explicitly employee, NOT owner, and NOT manager
    const showEmployeeView = roleLoaded && isEmployee && !isOwner && !isManager;

    const canUseLeaveRequests = plan?.canUseLeaveRequests ?? false;
    const canUseSubQrCodes = plan?.canUseSubQrCodes ?? false;
    const hasWorkspace = !!workspacePublicId;

    const resolvedManageNav: NavItemDef[] = canUseSubQrCodes
        ? [
              ...ownerManageNav.slice(0, ownerManageNav.length - 1),
              { to: '/console/qr-codes', icon: QrCode, label: 'nav.qrCodes' },
              ownerManageNav[ownerManageNav.length - 1],
          ]
        : ownerManageNav;

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 md:top-14 bottom-0 w-55 bg-cream-2 border-r border-cream-3 flex flex-col',
                'z-50 md:z-10 transform transition-transform duration-300 ease-in-out md:translate-x-0',
                mobileOpen ? 'translate-x-0' : '-translate-x-full',
            )}
            aria-label={t('nav.sidebar', 'Main navigation')}
        >
            {/* Mobile-only close button — the topbar's logo + workspace selector
                live in the topbar, so we only need the close X on the drawer
                version of the sidebar. md+ hides this entirely. */}
            {onMobileClose && (
                <div className="md:hidden px-5 py-4 flex items-center justify-end border-b border-cream-3/40">
                    <button
                        type="button"
                        onClick={onMobileClose}
                        className="p-1 -mr-1 text-text-secondary hover:text-text-primary transition-colors"
                        aria-label={t('common.close', 'Close')}
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 pt-3 flex flex-col overflow-y-auto">
                {showOwnerView && (
                    <>
                        <NavItem to="/console/dashboard" icon={LayoutDashboard} label="nav.dashboard" />
                        <NavSection
                            items={ownerMainNav.filter((i) => i.to !== '/console/dashboard')}
                            canUseLeaveRequests={canUseLeaveRequests}
                            disabled={!hasWorkspace}
                        />
                        <Divider />
                        <NavSection items={resolvedManageNav} disabled={!hasWorkspace} />
                    </>
                )}

                {showManagerView && (() => {
                    const managerNav = buildManagerNav(roleContext?.managerPermissions ?? []);
                    return (
                        <>
                            <NavItem to="/console/dashboard" icon={LayoutDashboard} label="nav.dashboard" />
                            <NavSection
                                items={managerNav.filter((i) => i.to !== '/console/dashboard')}
                                canUseLeaveRequests={canUseLeaveRequests}
                                disabled={!hasWorkspace}
                            />
                        </>
                    );
                })()}

                {showEmployeeView && (
                    <>
                        <div className="space-y-0.5">
                            <NavItem to="/console/dashboard" icon={LayoutDashboard} label="nav.dashboard" />
                        </div>
                        <NavSection
                            items={employeeMainNav.filter((i) => i.to !== '/console/dashboard')}
                            canUseLeaveRequests={canUseLeaveRequests}
                            disabled={!hasWorkspace}
                        />
                    </>
                )}

                {/* If role context hasn't loaded yet, show a minimal fallback */}
                {!roleContext && (
                    <NavSection
                        items={[
                            { to: '/console/dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
                        ]}
                    />
                )}

                <Divider />

                {/* Bottom section: Help link only. Profile / Admin panel /
                    Sign out moved to the topbar user-avatar menu; language +
                    theme moved to the topbar action row. */}
                <div className="space-y-0.5 mt-auto mb-4">
                    <HelpLink />
                </div>
            </nav>
        </aside>
    );
}

function HelpLink() {
    const { t } = useTranslation();
    return (
        <a
            href="/guides"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer mb-px font-sans text-[15.5px] no-underline text-text-secondary hover:bg-cream-3 hover:text-text-primary transition-all duration-180 border border-transparent"
        >
            <HelpCircle size={16} />
            <span className="flex-1">{t('nav.help')}</span>
        </a>
    );
}
