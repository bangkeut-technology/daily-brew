import { AuthenticationAction, AuthenticationState } from '@/contexts/authentication-context';

export const authenticationInitialState: AuthenticationState = {
    status: 'loading',
    user: undefined,
    demo: false,
    workspace: undefined,
};
export const authenticationReducer = (
    state: AuthenticationState,
    action: AuthenticationAction,
): AuthenticationState => {
    switch (action.type) {
        case 'SIGN_IN': {
            const { user } = action;
            return {
                ...state,
                user: user,
                status: 'authenticated',
            };
        }
        case 'SET_WORKSPACE': {
            const { workspace } = action;
            return {
                ...state,
                workspace: workspace,
            };
        }
        case 'SIGN_OUT':
            return {
                ...state,
                user: undefined,
                workspace: undefined,
                status: 'unauthenticated',
            };
    }
};
