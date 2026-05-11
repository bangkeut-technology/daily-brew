import React from 'react';
import { createFileRoute, Outlet, redirect, useRouter } from '@tanstack/react-router';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { getWorkspacePublicId, clearWorkspacePublicId } from '@/lib/auth';
import type { ManagerPermission } from '@/types';

export const Route = createFileRoute('/console')({
  beforeLoad: ({ context, location }) => {
    const auth = (context as { authentication?: { status: string } }).authentication;
    if (auth?.status === 'unauthenticated') {
      throw redirect({ to: '/sign-in', search: { redirect: location.href } });
    }
  },
  component: ConsoleLayout,
});

/**
 * Routes a regular linked employee (no manager role) must never reach.
 * Owners always pass; managers pass only when they hold the matching
 * permission listed in PERMISSION_GATED_ROUTES below.
 */
const STAFF_BLOCKED_ROUTES = [
  '/console/employees',
  '/console/shifts',
  '/console/closures',
  '/console/settings',
  '/console/qr-codes',
];

/**
 * Manager-accessible routes that require a specific permission.
 * Routes NOT in this map (e.g. /console/settings, /console/qr-codes) stay
 * owner-only regardless of manager permissions.
 */
const PERMISSION_GATED_ROUTES: Record<string, ManagerPermission> = {
  '/console/employees': 'manage_employees',
  '/console/shifts': 'manage_shifts',
  '/console/closures': 'manage_closures',
};

function ConsoleLayout() {
  const router = useRouter();
  const auth = useAuthenticationState();
  const { data: roleContext } = useRoleContext();

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.navigate({
        to: '/sign-in',
        search: { redirect: router.state.location.href },
        replace: true,
      });
    }
  }, [auth.status, router]);

  // Redirect to onboarding if not completed and no workspace
  React.useEffect(() => {
    if (!roleContext) return;
    const hasWorkspace = !!getWorkspacePublicId();
    if (!hasWorkspace && !roleContext.onboardingCompleted) {
      router.navigate({ to: '/onboarding', replace: true });
    }
  }, [roleContext, router]);

  // On 403 workspace-invalid, clear stale workspace and redirect to dashboard
  React.useEffect(() => {
    const handler = () => {
      clearWorkspacePublicId();
      router.navigate({ to: '/console/dashboard', replace: true });
    };
    window.addEventListener('dailybrew:workspace-invalid', handler);
    return () => window.removeEventListener('dailybrew:workspace-invalid', handler);
  }, [router]);

  // Redirect to dashboard if no workspace and not already on dashboard/profile
  React.useEffect(() => {
    const path = router.state.location.pathname;
    const hasWorkspace = !!getWorkspacePublicId();
    const allowedWithoutWorkspace = ['/console/dashboard', '/console/profile'];
    const isAllowed = allowedWithoutWorkspace.some(
      (p) => path === p || path.startsWith(p + '/'),
    );
    if (!hasWorkspace && !isAllowed) {
      router.navigate({ to: '/console/dashboard', replace: true });
    }
  }, [router.state.location.pathname, router]);

  // Redirect away from routes the current role can't reach.
  // - Owner: passes everything.
  // - Manager with the matching permission: passes /employees, /shifts, /closures.
  // - Manager without the permission (or regular employee): redirect to dashboard.
  // - /settings, /qr-codes stay owner-only regardless of manager permissions.
  React.useEffect(() => {
    if (!roleContext) return;
    if (roleContext.isOwner) return;

    const path = router.state.location.pathname;
    const blockedRoute = STAFF_BLOCKED_ROUTES.find(
      (r) => path === r || path.startsWith(r + '/'),
    );
    if (!blockedRoute) return;

    const required = PERMISSION_GATED_ROUTES[blockedRoute];
    const allowedByPermission =
      required !== undefined
      && roleContext.isManager
      && roleContext.managerPermissions.includes(required);

    if (!allowedByPermission) {
      router.navigate({ to: '/console/dashboard', replace: true });
    }
  }, [roleContext, router.state.location.pathname, router]);

  if (auth.status === 'loading') return null;

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-[220px] p-8 page-enter">
        <Outlet />
      </main>
    </div>
  );
}
