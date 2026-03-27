import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Sidebar } from '@/components/layout/Sidebar';
import type { AuthenticationState } from '@/contexts/authentication-context';

export const Route = createFileRoute('/console')({
  beforeLoad: ({ context }) => {
    const auth = (context as { authentication?: AuthenticationState }).authentication;
    if (auth?.status === 'unauthenticated') {
      throw redirect({ to: '/sign-in', search: { redirect: location.href } });
    }
  },
  component: ConsoleLayout,
});

function ConsoleLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-[220px] p-8 page-enter">
        <Outlet />
      </main>
    </div>
  );
}
