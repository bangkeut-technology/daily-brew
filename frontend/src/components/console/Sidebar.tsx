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
  QrCode,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoleContext } from "@/hooks/useRoleContext";
import type { ManagerPermission } from "@/types/auth";

interface NavItemDef {
  to: string;
  icon: LucideIcon;
  label: string;
}

const DASHBOARD: NavItemDef = { to: "/console/dashboard", icon: LayoutDashboard, label: "nav.dashboard" };
const ATTENDANCE: NavItemDef = { to: "/console/attendance", icon: CalendarCheck, label: "nav.attendance" };
const LEAVE: NavItemDef = { to: "/console/leave", icon: FileText, label: "nav.leaveRequests" };

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

const EMPLOYEE_NAV: NavItemDef[] = [DASHBOARD, ATTENDANCE, LEAVE];

function signOut() {
  const locale = sessionStorage.getItem("locale") || "en";
  // Real form POST so the browser follows the redirect and processes the
  // Set-Cookie headers that clear the JWT + refresh cookies.
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `/api/v1/${locale}/auth/logout`;
  document.body.appendChild(form);
  form.submit();
}

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data: roleContext } = useRoleContext();

  let items = EMPLOYEE_NAV;
  if (roleContext?.isOwner) items = ownerNav();
  else if (roleContext?.isManager) items = managerNav(roleContext.managerPermissions);

  return (
    <aside className="fixed inset-y-0 left-0 flex w-[220px] flex-col border-r border-glass-border bg-glass-bg backdrop-blur-md">
      <Link href="/console/dashboard" className="px-6 py-5 font-serif text-xl font-semibold text-coffee no-underline">
        DailyBrew
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm no-underline transition-colors",
                active
                  ? "bg-coffee text-white"
                  : "text-text-secondary hover:bg-cream-3 hover:text-text-primary",
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.label)}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={signOut}
        className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-cream-3 hover:text-text-primary"
      >
        <LogOut className="h-4 w-4" />
        {t("nav.signOut", "Sign out")}
      </button>
    </aside>
  );
}
