import { createLazyFileRoute, Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { LayoutDashboard, ShieldCheck, LogOut, Building2, UserCircle, CreditCard, ScrollText, Smartphone, ToggleLeft, AlarmClock, Menu, X } from 'lucide-react';
import { LogoBrand } from '@/components/shared/Logo';
import { cn } from '@/lib/utils';

export const Route = createLazyFileRoute('/admin')({
  component: AdminLayout,
});

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/workspaces', icon: Building2, label: 'Workspaces' },
  { to: '/admin/users', icon: UserCircle, label: 'Users' },
  { to: '/admin/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/admin/mobile-app-config', icon: Smartphone, label: 'Mobile app' },
  { to: '/admin/feature-flags', icon: ToggleLeft, label: 'Feature flags' },
  { to: '/admin/cron', icon: AlarmClock, label: 'Cron' },
  { to: '/admin/audit-log', icon: ScrollText, label: 'Audit log' },
];

function AdminLayout() {
  const auth = useAuthenticationState();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Hard gate: only super admins
  useEffect(() => {
    if (auth.status === 'authenticated' && !auth.user?.isSuperAdmin) {
      navigate({ to: '/console/dashboard', replace: true });
    }
  }, [auth.status, auth.user, navigate]);

  // Close the drawer on every navigation. Watching pathname catches back/forward too.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  if (auth.status === 'loading') return null;
  if (auth.status === 'authenticated' && !auth.user?.isSuperAdmin) return null;

  const signOut = () => {
    sessionStorage.removeItem('workspace_public_id');
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/api/v1/${sessionStorage.getItem('locale') || 'en'}/auth/logout`;
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="min-h-screen">
      {/* Mobile top bar — same shape as the console shell so super-admins
          on a phone get the familiar drawer pattern. */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-cream-2 border-b border-cream-3 flex items-center px-4 z-30">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Open menu"
          aria-expanded={mobileNavOpen}
        >
          <Menu size={22} />
        </button>
        <div className="flex-1 flex justify-center">
          <LogoBrand size={26} />
        </div>
        <div className="w-9" aria-hidden />
      </header>

      {mobileNavOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — off-canvas below md, persistent at md+ */}
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 w-55 bg-cream-2 border-r border-cream-3 flex flex-col',
          'z-50 md:z-10 transform transition-transform duration-300 ease-in-out md:translate-x-0',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="px-5 py-5 flex items-center justify-between">
          <LogoBrand size={28} />
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="md:hidden p-1 -mr-1 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-coffee/8 border border-coffee/15">
            <ShieldCheck size={14} className="text-coffee" />
            <span className="text-[12.5px] font-semibold text-coffee">Platform admin</span>
          </div>
        </div>

        <nav className="flex-1 px-3 flex flex-col overflow-y-auto">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname === item.to || location.pathname.startsWith(item.to + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer mb-px font-sans text-[15.5px] transition-all duration-180 no-underline',
                  active
                    ? 'bg-glass-bg backdrop-blur-sm text-coffee font-medium border border-glass-border shadow-sm'
                    : 'text-text-secondary hover:bg-cream-3 hover:text-text-primary border border-transparent',
                )}
              >
                <Icon size={16} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}

          <div className="mt-auto mb-4 space-y-1">
            <Link
              to="/console/dashboard"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer w-full font-sans text-[15.5px] text-text-secondary hover:bg-cream-3 hover:text-text-primary transition-all duration-180 no-underline"
            >
              <LayoutDashboard size={16} />
              Back to console
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer w-full font-sans text-[15.5px] text-text-secondary hover:bg-cream-3 hover:text-text-primary transition-all duration-180 border-none bg-transparent"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </nav>
      </aside>

      <main className="pt-14 md:pt-0 p-4 md:p-8 md:ml-[220px] page-enter">
        <Outlet />
      </main>
    </div>
  );
}
