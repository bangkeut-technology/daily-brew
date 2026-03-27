import { Link, useLocation } from '@tanstack/react-router';
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    FileText,
    Clock,
    CalendarOff,
    Settings,
    UserCircle,
    LogOut,
    Crown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthenticationDispatch } from '@/hooks/use-authentication';
import { apiAxios } from '@/lib/apiAxios';
import { usePlan } from '@/hooks/queries/usePlan';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { getWorkspacePublicId } from '@/lib/auth';
import { LogoBrand } from '@/components/shared/Logo';

interface NavItemDef {
    to: string;
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    brewPlus?: boolean;
    badge?: number;
}

const ownerMainNav: NavItemDef[] = [
    { to: '/console/dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
    { to: '/console/employees', icon: Users, label: 'nav.employees' },
    { to: '/console/attendance', icon: CalendarCheck, label: 'nav.attendance' },
    { to: '/console/leave', icon: FileText, label: 'nav.leaveRequests', brewPlus: true },
];

const ownerManageNav: NavItemDef[] = [
    { to: '/console/shifts', icon: Clock, label: 'nav.shifts' },
    { to: '/console/closures', icon: CalendarOff, label: 'nav.closures' },
    { to: '/console/settings', icon: Settings, label: 'nav.settings' },
];

const employeeMainNav: NavItemDef[] = [
    { to: '/console/dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
    { to: '/console/attendance', icon: CalendarCheck, label: 'nav.myAttendance' },
    { to: '/console/leave', icon: FileText, label: 'nav.myLeaveRequests' },
];

function NavItem({
    to,
    icon: Icon,
    label,
    brewPlus,
    canUseLeaveRequests,
    badge,
}: {
    to: string;
    icon: React.ComponentType<{ size?: number }>;
    label: string;
    brewPlus?: boolean;
    canUseLeaveRequests?: boolean;
    badge?: number;
}) {
    const { t } = useTranslation();
    const location = useLocation();
    const active = location.pathname === to || location.pathname.startsWith(to + '/');

    return (
        <Link
            to={to}
            className={`
                relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer mb-px
                font-sans text-[13.5px] transition-all duration-[180ms] no-underline
                ${
                    active
                        ? 'bg-white/62 backdrop-blur-sm text-[#6B4226] font-medium border border-white/85 shadow-[0_1px_4px_rgba(107,66,38,0.08)]'
                        : 'text-[#7C6860] hover:bg-[#EBE2D6] hover:text-[#2C2420] border border-transparent'
                }
            `}
        >
            <Icon size={16} />
            <span className="flex-1">{t(label)}</span>
            {brewPlus && !canUseLeaveRequests && (
                <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-[#C17F3B]">
                    <Crown size={12} className="opacity-60" />
                    <span>Brew+</span>
                </span>
            )}
            {badge != null && badge > 0 && (
                <span className="ml-auto bg-[#C17F3B] text-white text-[10px] font-semibold px-1.5 py-px rounded-full leading-normal">
                    {badge}
                </span>
            )}
            <span
                className={`absolute right-2.5 w-1 h-1 rounded-full bg-[#C17F3B] transition-opacity ${
                    active ? 'opacity-100' : 'opacity-0'
                }`}
            />
        </Link>
    );
}

function NavSection({ items, canUseLeaveRequests }: { items: NavItemDef[]; canUseLeaveRequests?: boolean }) {
    return (
        <div className="space-y-0.5">
            {items.map((item) => (
                <NavItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    brewPlus={item.brewPlus}
                    canUseLeaveRequests={canUseLeaveRequests}
                    badge={item.badge}
                />
            ))}
        </div>
    );
}

function Divider() {
    return <div className="my-3 border-t border-[#EBE2D6]" />;
}

export function Sidebar() {
    const { t } = useTranslation();
    const dispatch = useAuthenticationDispatch();
    const signOut = async () => {
        try { await apiAxios.post('/auth/logout'); } catch { /* ignore */ }
        dispatch({ type: 'SIGN_OUT' });
    };
    const workspacePublicId = getWorkspacePublicId() ?? '';
    const { data: plan } = usePlan(workspacePublicId);
    const { data: roleContext } = useRoleContext();

    const isOwner = roleContext?.isOwner ?? false;
    const isEmployee = roleContext?.isEmployee ?? false;
    const showOwnerView = isOwner || (isOwner && isEmployee);
    const showEmployeeView = isEmployee && !isOwner;

    const canUseLeaveRequests = plan?.canUseLeaveRequests ?? false;

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-[#F3EDE3] border-r border-[#EBE2D6] flex flex-col z-10">
            {/* Logo */}
            <div className="px-5 py-5">
                <LogoBrand size={28} />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 flex flex-col overflow-y-auto">
                {showOwnerView && (
                    <>
                        <NavSection items={ownerMainNav} canUseLeaveRequests={canUseLeaveRequests} />
                        <Divider />
                        <NavSection items={ownerManageNav} />
                    </>
                )}

                {showEmployeeView && (
                    <NavSection items={employeeMainNav} canUseLeaveRequests={canUseLeaveRequests} />
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

                {/* Bottom section: Profile + Sign Out */}
                <div className="space-y-0.5">
                    <NavItem
                        to="/console/profile"
                        icon={UserCircle}
                        label="nav.profile"
                    />
                </div>

                <div className="mt-auto mb-4">
                    <button
                        onClick={signOut}
                        className="
                            flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer
                            w-full font-sans text-[13.5px] text-[#7C6860]
                            hover:bg-[#EBE2D6] hover:text-[#2C2420]
                            transition-all duration-[180ms]
                            border-none bg-transparent
                        "
                    >
                        <LogOut size={16} />
                        {t('nav.signOut')}
                    </button>
                </div>
            </nav>
        </aside>
    );
}
