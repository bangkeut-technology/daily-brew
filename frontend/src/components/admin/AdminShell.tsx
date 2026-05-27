"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  UserCircle,
  CreditCard,
  ScrollText,
  Smartphone,
  ToggleLeft,
  AlarmClock,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const NAV: { to: string; icon: LucideIcon; label: string; exact?: boolean }[] = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/admin/workspaces", icon: Building2, label: "Workspaces" },
  { to: "/admin/users", icon: UserCircle, label: "Users" },
  { to: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { to: "/admin/mobile-app-config", icon: Smartphone, label: "Mobile app" },
  { to: "/admin/feature-flags", icon: ToggleLeft, label: "Feature flags" },
  { to: "/admin/cron", icon: AlarmClock, label: "Cron" },
  { to: "/admin/audit-log", icon: ScrollText, label: "Audit log" },
];

function signOut() {
  const locale = sessionStorage.getItem("locale") || "en";
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `/api/v1/${locale}/auth/logout`;
  document.body.appendChild(form);
  form.submit();
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();

  // Hard gate: super admins only.
  React.useEffect(() => {
    if (auth.status === "unauthenticated") {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
    } else if (auth.status === "authenticated" && !auth.user?.isSuperAdmin) {
      router.replace("/console/dashboard");
    }
  }, [auth.status, auth.user, pathname, router]);

  if (auth.status !== "authenticated" || !auth.user?.isSuperAdmin) {
    return <div className="min-h-screen" aria-busy="true" />;
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-[220px] flex-col border-r border-glass-border bg-glass-bg backdrop-blur-md">
        <div className="px-6 py-5">
          <span className="font-serif text-xl font-semibold text-coffee">DailyBrew</span>
          <span className="ml-1 text-xs font-medium text-text-tertiary">admin</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
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
                {item.label}
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
          Sign out
        </button>
      </aside>
      <main className="ml-[220px] p-8 page-enter">{children}</main>
    </div>
  );
}
