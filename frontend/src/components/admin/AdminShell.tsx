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
  ShieldCheck,
  LogOut,
  Menu,
  X,
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
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  // Hard gate: super admins only.
  React.useEffect(() => {
    if (auth.status === "unauthenticated") {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
    } else if (auth.status === "authenticated" && !auth.user?.isSuperAdmin) {
      router.replace("/console/dashboard");
    }
  }, [auth.status, auth.user, pathname, router]);

  // Close the drawer on every navigation, back/forward included. Adjusting
  // state during render (rather than in an effect) is React's documented
  // pattern for "reset state when a value changes" and avoids the cascading
  // re-render an effect would cause.
  const [navPathname, setNavPathname] = React.useState(pathname);
  if (navPathname !== pathname) {
    setNavPathname(pathname);
    if (mobileNavOpen) setMobileNavOpen(false);
  }

  // Lock body scroll while the drawer is open.
  React.useEffect(() => {
    if (!mobileNavOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileNavOpen]);

  if (auth.status !== "authenticated" || !auth.user?.isSuperAdmin) {
    return <div className="min-h-screen" aria-busy="true" />;
  }

  return (
    <div className="min-h-screen">
      {/* Mobile top bar — same shape as the console shell so super-admins on a
          phone get the familiar drawer pattern. */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center border-b border-cream-3 bg-cream-2 px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileNavOpen}
          className="-ml-2 p-2 text-text-secondary transition-colors hover:text-text-primary"
        >
          <Menu size={22} />
        </button>
        <div className="flex flex-1 justify-center">
          <span className="font-serif text-lg font-semibold text-coffee">DailyBrew</span>
          <span className="ml-1 self-center text-xs font-medium text-text-tertiary">admin</span>
        </div>
        <div className="w-9" aria-hidden />
      </header>

      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-glass-border bg-cream-2 md:z-10 md:bg-glass-bg md:backdrop-blur-md",
          "transform transition-transform duration-300 ease-in-out md:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <span>
            <span className="font-serif text-xl font-semibold text-coffee">DailyBrew</span>
            <span className="ml-1 text-xs font-medium text-text-tertiary">admin</span>
          </span>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close"
            className="-mr-1 p-1 text-text-secondary transition-colors hover:text-text-primary md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 rounded-lg border border-coffee/15 bg-coffee/8 px-2.5 py-2">
            <ShieldCheck size={14} className="text-coffee" />
            <span className="text-[12.5px] font-semibold text-coffee">Platform admin</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(`${item.to}/`);
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

        <div className="m-3 space-y-1">
          <Link
            href="/console/dashboard"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-secondary no-underline transition-colors hover:bg-cream-3 hover:text-text-primary"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to console
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-cream-3 hover:text-text-primary"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="page-enter p-4 pt-18 md:ml-[220px] md:p-8 md:pt-8">{children}</main>
    </div>
  );
}
