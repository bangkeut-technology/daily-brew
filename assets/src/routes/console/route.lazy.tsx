import React from 'react';
import { createLazyFileRoute, Outlet, useRouter } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '@/components/layout/Sidebar';
import { LogoBrand } from '@/components/shared/Logo';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { useRoleContext } from '@/hooks/queries/useRoleContext';
import { getWorkspacePublicId, clearWorkspacePublicId } from '@/lib/auth';
import type { ManagerPermission } from '@/types';

export const Route = createLazyFileRoute('/console')({
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
  const { t } = useTranslation();
  const auth = useAuthenticationState();
  const { data: roleContext } = useRoleContext();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  // Close the mobile drawer on every route change so navigation feels native.
  // Listens on the resolved pathname so back/forward also dismiss the drawer.
  React.useEffect(() => {
    setMobileNavOpen(false);
  }, [router.state.location.pathname]);

  // Lock body scroll while the drawer is open. Restoring on unmount handles
  // the case where the layout unmounts mid-open (e.g. sign-out).
  React.useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

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
      {/* Mobile top bar — hidden on md+. Only utility is the drawer trigger;
          per design decision, all account/lang/theme controls stay inside
          the drawer. Logo doubles as a quick "back to dashboard" affordance
          via the Sidebar's own logo on md+, but is purely decorative here. */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-cream-2 border-b border-cream-3 flex items-center px-4 z-30">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label={t('nav.openMenu', 'Open menu')}
          aria-expanded={mobileNavOpen}
        >
          <Menu size={22} />
        </button>
        <div className="flex-1 flex justify-center">
          <LogoBrand size={26} />
        </div>
        {/* Right-side spacer keeps the logo optically centred over the hamburger. */}
        <div className="w-9" aria-hidden />
      </header>

      {/* Backdrop — closes the drawer on tap. Only renders while open so it
          doesn't intercept events on desktop. */}
      {mobileNavOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden
        />
      )}

      <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />
      <main className="pt-14 md:pt-0 p-4 md:p-8 md:ml-[220px] page-enter">
        <Outlet />
      </main>
    </div>
  );
}
