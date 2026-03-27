import React from 'react';
import { AuthenticationContextDispatch, AuthenticationContextState } from '@/contexts/authentication-context';
import { authenticationReducer, initialAuthenticationState } from '@/reducers/authentication-reducer';
import { useQuery } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';

export const AuthenticationProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = React.useReducer(authenticationReducer, initialAuthenticationState);

    const { data, isSuccess, isError } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const { data } = await apiAxios.get('/users/me');
            return data;
        },
        enabled: state.status === 'loading',
        retry: false,
        staleTime: 0,
    });

    const { data: workspace } = useQuery({
        queryKey: ['my-current-workspace'],
        queryFn: async () => {
            const { data } = await apiAxios.get('/users/me/current-workspace');
            return data;
        },
        enabled: state.status === 'authenticated',
        retry: false,
    });

    React.useEffect(() => {
        if (isError) dispatch({ type: 'SIGN_OUT' });
    }, [isError]);

    React.useEffect(() => {
        if (isSuccess && data) dispatch({ type: 'SIGN_IN', user: data });
    }, [isSuccess, data]);

    React.useEffect(() => {
        if (workspace) dispatch({ type: 'SET_WORKSPACE', workspace });
    }, [workspace]);

    if (state.status === 'loading') return <BrewingLoader />;

    return (
        <AuthenticationContextState.Provider value={state}>
            <AuthenticationContextDispatch.Provider value={dispatch}>
                {children}
            </AuthenticationContextDispatch.Provider>
        </AuthenticationContextState.Provider>
    );
};

AuthenticationProvider.displayName = 'AuthenticationProvider';

const BrewingLoader = () => (
    <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-5">
            <div className="relative">
                {/* Steam */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                    <div className="w-[2px] h-4 bg-amber/30 rounded-full animate-steam-1" />
                    <div className="w-[2px] h-5 bg-amber/20 rounded-full animate-steam-2" />
                    <div className="w-[2px] h-4 bg-amber/30 rounded-full animate-steam-3" />
                </div>
                {/* Cup */}
                <div className="w-12 h-10 rounded-b-xl border-[2.5px] border-coffee relative overflow-hidden" style={{ borderTop: 'none' }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-coffee to-coffee-light animate-brew-fill rounded-b-lg" />
                </div>
                {/* Handle */}
                <div className="absolute top-1 -right-2.5 w-3 h-5 border-[2.5px] border-coffee rounded-r-full border-l-0" />
            </div>
            <span className="text-[13px] text-text-tertiary font-sans tracking-wide">Brewing...</span>
        </div>
        <style>{`
            @keyframes steam1 { 0%,100% { opacity:0; transform:translateY(0) scaleY(1); } 50% { opacity:1; transform:translateY(-8px) scaleY(1.3); } }
            @keyframes steam2 { 0%,100% { opacity:0; transform:translateY(0) scaleY(1); } 50% { opacity:1; transform:translateY(-10px) scaleY(1.4); } }
            @keyframes steam3 { 0%,100% { opacity:0; transform:translateY(0) scaleY(1); } 50% { opacity:1; transform:translateY(-6px) scaleY(1.2); } }
            @keyframes brewFill { 0% { height:0%; } 60% { height:70%; } 100% { height:70%; } }
            .animate-steam-1 { animation: steam1 2s ease-in-out infinite; }
            .animate-steam-2 { animation: steam2 2s ease-in-out infinite 0.3s; }
            .animate-steam-3 { animation: steam3 2s ease-in-out infinite 0.6s; }
            .animate-brew-fill { animation: brewFill 2s ease-out infinite; }
        `}</style>
    </div>
);
