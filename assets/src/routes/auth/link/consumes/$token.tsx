import { createFileRoute, Navigate } from '@tanstack/react-router';
import axios, { isAxiosError } from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FullScreenLoader } from '@/components/full-screen-loader';
import React from 'react';
import { useAuthenticationDispatch } from '@/hooks/use-authentication';
import { User } from '@/types/user';

export const Route = createFileRoute('/auth/link/consumes/$token')({
    component: ConsumesLinkTokenPage,
});

function ConsumesLinkTokenPage() {
    const { token } = Route.useParams();
    const dispatch = useAuthenticationDispatch();
    const queryClient = useQueryClient();

    const { data, isSuccess, isPending, error } = useQuery({
        queryKey: ['link-token', token],
        queryFn: () =>
            axios.get<{ token: string; user: User }>(`/auth/magic/consumes/${token}`).then((res) => res.data),
        retry: false,
    });

    React.useEffect(() => {
        if (isSuccess && data) {
            dispatch({ type: 'SIGN_IN', user: data.user });
            queryClient.invalidateQueries({ queryKey: ['me'] });
        }
    }, [data, dispatch, isSuccess, queryClient, token]);

    if (isPending) return <FullScreenLoader text="Checking sign in link token..." />;

    if (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
            return <Navigate to="/link-error" search={{ reason: error.response.data.context.reason }} />;
        }

        return <Navigate to="/link-error" search={{ reason: 'invalid' }} />;
    }

    return <Navigate to="/console" />;
}
