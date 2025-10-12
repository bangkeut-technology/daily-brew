import React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { startDemoSession } from '@/services/demo';
import { Loading } from '@/components/loader/loading';
import { useDemoSessionDispatch } from '@/hooks/use-demo-session';
import { toast } from 'sonner';

export const Route = createFileRoute('/_layout/demo')({
    component: DemoPage,
});

function DemoPage() {
    const navigate = useNavigate();
    const dispatch = useDemoSessionDispatch();
    const { mutate, isPending } = useMutation({
        mutationFn: startDemoSession,
        onSuccess: (data) => {
            toast.success(data.message);
            dispatch({ type: 'SET_DEMO_SESSION', payload: data.demoSession });
            navigate({ to: '/console' }).then();
        },
        onError: () => {
            console.error('Failed to start demo session');
            alert('Failed to start demo session');
        },
    });

    React.useEffect(() => {
        mutate();
    }, [mutate]);

    if (isPending) {
        return <Loading loadingText="Starting demo session..." />;
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <p>Redirecting to demo session...</p>
        </div>
    );
}
