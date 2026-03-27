import React from 'react';
import { createFileRoute, Outlet, redirect, useRouter } from '@tanstack/react-router';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthenticationState } from '@/hooks/use-authentication';

export const Route = createFileRoute('/console')({
  beforeLoad: ({ context, location }) => {
    const auth = (context as { authentication?: { status: string } }).authentication;
    if (auth?.status === 'unauthenticated') {
      throw redirect({ to: '/sign-in', search: { redirect: location.href } });
    }
  },
  component: ConsoleLayout,
});

function ConsoleLayout() {
  const router = useRouter();
  const auth = useAuthenticationState();

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      router.navigate({
        to: '/sign-in',
        search: { redirect: router.state.location.href },
        replace: true,
      });
    }
  }, [auth.status, router]);

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
