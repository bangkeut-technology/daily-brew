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
  UserCircle,
  LogOut,
  X,
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

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data: roleContext } = useRoleContext();

  let items = EMPLOYEE_NAV;
  if (roleContext?.isOwner) items = ownerNav();
  else if (roleContext?.isManager) items = managerNav(roleContext.managerPermissions);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-glass-border bg-cream-2 md:z-10 md:bg-glass-bg md:backdrop-blur-md",
        "transform transition-transform duration-300 ease-in-out md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <Link
          href="/console/dashboard"
          className="font-serif text-xl font-semibold text-coffee no-underline"
        >
          DailyBrew
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1 p-1 text-text-secondary transition-colors hover:text-text-primary md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
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

      <Link
        href="/console/profile"
        className={cn(
          "m-3 mb-0 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm no-underline transition-colors",
          pathname === "/console/profile"
            ? "bg-coffee text-white"
            : "text-text-secondary hover:bg-cream-3 hover:text-text-primary",
        )}
      >
        <UserCircle className="h-4 w-4" />
        {t("nav.profile", "Profile")}
      </Link>

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
