import React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { startDemoSession } from '@/services/demo';
import { Loading } from '@/components/loader/loading';

export const Route = createFileRoute('/_layout/demo/')({
    component: () => DemoPage,
});

function DemoPage() {
    const navigate = useNavigate();
    const { mutate, isPending } = useMutation({
        mutationFn: startDemoSession,
        onSuccess: () => navigate({ to: '/console',  }),
        onError: () => {
            console.error('Failed to start demo session');
            alert('Failed to start demo session');
        },
    });

    React.useEffect(() => {
        mutate()
    }, [mutate])

    if (isPending) {
        return <Loading loadingText="Starting demo session..." />;
    }

    return <div>Demo Page</div>;
}
