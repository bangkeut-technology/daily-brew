import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/onboarding')({
  beforeLoad: ({ context }) => {
    const auth = (context as { authentication?: { status: string } }).authentication;
    if (auth?.status === 'unauthenticated') {
      throw redirect({ to: '/sign-in' });
    }
  },
});
