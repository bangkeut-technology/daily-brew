"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useRoleContext } from "@/hooks/useRoleContext";
import { getWorkspacePublicId, clearWorkspacePublicId } from "@/lib/api";
import type { ManagerPermission } from "@/types/auth";
import { Sidebar } from "@/components/console/Sidebar";

const STAFF_BLOCKED_ROUTES = [
  "/console/employees",
  "/console/shifts",
  "/console/closures",
  "/console/settings",
  "/console/qr-codes",
];

const PERMISSION_GATED_ROUTES: Record<string, ManagerPermission> = {
  "/console/employees": "manage_employees",
  "/console/shifts": "manage_shifts",
  "/console/closures": "manage_closures",
};

const ALLOWED_WITHOUT_WORKSPACE = ["/console/dashboard", "/console/profile"];

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const { data: roleContext } = useRoleContext();

  // Redirect unauthenticated users to sign-in.
  React.useEffect(() => {
    if (auth.status === "unauthenticated") {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [auth.status, pathname, router]);

  // Onboarding redirect: no workspace and onboarding not completed.
  React.useEffect(() => {
    if (!roleContext) return;
    if (!getWorkspacePublicId() && !roleContext.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [roleContext, router]);

  // Stale-workspace event (403 on a workspace endpoint) → clear + dashboard.
  React.useEffect(() => {
    const handler = () => {
      clearWorkspacePublicId();
      router.replace("/console/dashboard");
    };
    window.addEventListener("dailybrew:workspace-invalid", handler);
    return () => window.removeEventListener("dailybrew:workspace-invalid", handler);
  }, [router]);

  // No workspace and not on a workspace-optional route → dashboard.
  React.useEffect(() => {
    const isAllowed = ALLOWED_WITHOUT_WORKSPACE.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );
    if (!getWorkspacePublicId() && !isAllowed) {
      router.replace("/console/dashboard");
    }
  }, [pathname, router]);

  // Permission-gated routes (owners bypass).
  React.useEffect(() => {
    if (!roleContext || roleContext.isOwner) return;
    const blocked = STAFF_BLOCKED_ROUTES.find((r) => pathname === r || pathname.startsWith(r + "/"));
    if (!blocked) return;
    const required = PERMISSION_GATED_ROUTES[blocked];
    const allowed =
      required !== undefined &&
      roleContext.isManager &&
      roleContext.managerPermissions.includes(required);
    if (!allowed) router.replace("/console/dashboard");
  }, [roleContext, pathname, router]);

  if (auth.status === "loading") {
    return <div className="min-h-screen" aria-busy="true" />;
  }
  if (auth.status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-[220px] p-8 page-enter">{children}</main>
    </div>
  );
}
