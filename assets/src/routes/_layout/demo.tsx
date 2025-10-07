import React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startDemoSession } from '@/services/demo';
import { Loading } from '@/components/loader/loading';
import { fetchCurrentUser } from '@/services/user';

export const Route = createFileRoute('/_layout/demo')({
    component: DemoPage,
});

function DemoPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { mutate, isPending, error } = useMutation({
        mutationFn: startDemoSession,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['me']}).then(() => {
                navigate({ to: '/console' }).then();
            });
        },
        onError: () => {
            console.error('Failed to start demo session');
            alert('Failed to start demo session');
        },
    });

    console.log(error);

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
