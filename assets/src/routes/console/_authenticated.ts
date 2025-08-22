import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/console/_authenticated')({
    beforeLoad: ({ context, location }) => {
        if (!context.authentication?.isAuthenticated) {
            throw redirect({
                to: '/sign-in',
                search: {
                    redirect: location.href,
                },
            });
        }
    },
});
