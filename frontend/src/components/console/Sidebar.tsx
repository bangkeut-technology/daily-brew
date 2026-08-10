"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FileText,
  Clock,
  CalendarOff,
  Crown,
  QrCode,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getWorkspacePublicId } from "@/lib/api";
import { usePlan } from "@/hooks/usePlan";
import { useRoleContext } from "@/hooks/useRoleContext";
import type { ManagerPermission } from "@/types/auth";

interface NavItemDef {
  to: string;
  icon: LucideIcon;
  label: string;
  /** Marks a destination that needs Espresso, so the nav says so up front. */
  espresso?: boolean;
}

const DASHBOARD: NavItemDef = { to: "/console/dashboard", icon: LayoutDashboard, label: "nav.dashboard" };
const ATTENDANCE: NavItemDef = { to: "/console/attendance", icon: CalendarCheck, label: "nav.attendance" };
const LEAVE: NavItemDef = {
  to: "/console/leave",
  icon: FileText,
  label: "nav.leaveRequests",
  espresso: true,
};

function ownerNav(): NavItemDef[] {
  return [
    DASHBOARD,
    { to: "/console/employees", icon: Users, label: "nav.employees" },
    ATTENDANCE,
    LEAVE,
    { to: "/console/shifts", icon: Clock, label: "nav.shifts" },
    { to: "/console/closures", icon: CalendarOff, label: "nav.closures" },
    { to: "/console/qr-codes", icon: QrCode, label: "nav.qrCodes" },
    { to: "/console/settings", icon: Settings, label: "nav.settings" },
  ];
}

function managerNav(permissions: ManagerPermission[]): NavItemDef[] {
  const has = (p: ManagerPermission) => permissions.includes(p);
  const items: NavItemDef[] = [DASHBOARD, ATTENDANCE, LEAVE];
  if (has("manage_employees")) items.push({ to: "/console/employees", icon: Users, label: "nav.employees" });
  if (has("manage_shifts")) items.push({ to: "/console/shifts", icon: Clock, label: "nav.shifts" });
  if (has("manage_closures")) items.push({ to: "/console/closures", icon: CalendarOff, label: "nav.closures" });
  return items;
}

/**
 * A plain employee sees the same three destinations, but the labels are
 * possessive — an employee's Attendance page shows only their own rows, and
 * "My Attendance" says so before they open it.
 */
const EMPLOYEE_NAV: NavItemDef[] = [
  DASHBOARD,
  { ...ATTENDANCE, label: "nav.myAttendance" },
  { ...LEAVE, label: "nav.myLeaveRequests" },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data: roleContext } = useRoleContext();
  const { data: plan } = usePlan(getWorkspacePublicId() || "");
  const canUseLeaveRequests = plan?.canUseLeaveRequests ?? false;
  // Without a workspace every destination but the dashboard bounces straight
  // back (see ConsoleShell) — grey them out rather than let people bounce.
  const hasWorkspace = !!getWorkspacePublicId();

  let items = EMPLOYEE_NAV;
  if (roleContext?.isOwner) items = ownerNav();
  else if (roleContext?.isManager) items = managerNav(roleContext.managerPermissions);

  return (
    <aside
      className={cn(
        "fixed bottom-0 left-0 top-0 z-50 flex w-[220px] flex-col border-r border-glass-border bg-cream-2 md:top-14 md:z-10 md:bg-glass-bg md:backdrop-blur-md",
        "transform transition-transform duration-300 ease-in-out md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Brand lives in the top bar at md+; on mobile the drawer needs its
          own header for the close affordance. */}
      <div className="flex items-center justify-between px-6 py-5 md:hidden">
        <Link
          href="/console/dashboard"
          className="font-serif text-xl font-semibold text-coffee no-underline"
        >
          DailyBrew
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("common.close", "Close")}
          className="-mr-1 p-1 text-text-secondary transition-colors hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav aria-label={t("nav.sidebar", "Main navigation")} className="flex-1 space-y-1 overflow-y-auto px-3 pb-3 md:pt-3">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          const disabled = !hasWorkspace && item.to !== "/console/dashboard";
          const label = (
            <>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{t(item.label)}</span>
              {item.espresso && !canUseLeaveRequests && (
                <span className="flex items-center gap-1 text-[12px] font-semibold text-amber">
                  <Crown size={12} className="opacity-60" />
                  Espresso
                </span>
              )}
            </>
          );

          if (disabled) {
            return (
              <div
                key={item.to}
                aria-disabled="true"
                className="flex cursor-not-allowed select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-tertiary/50"
              >
                {label}
              </div>
            );
          }

          return (
            <Link
              key={item.to}
              href={item.to}
              // Anchor for the first-run GuidedTour, derived from the route so
              // a new nav item can't silently drop out of the tour.
              data-tour={`nav-${item.to.split("/").pop()}`}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm no-underline transition-colors",
                active
                  ? "bg-coffee text-white"
                  : "text-text-secondary hover:bg-cream-3 hover:text-text-primary",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
