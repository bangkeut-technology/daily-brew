import type { AuthenticationAction, AuthenticationState } from '@/contexts/authentication-context';

export const initialAuthenticationState: AuthenticationState = {
    status: 'loading',
    user: undefined,
    workspace: undefined,
};

export const authenticationReducer = (
    state: AuthenticationState,
    action: AuthenticationAction,
): AuthenticationState => {
    switch (action.type) {
        case 'SIGN_IN': {
            return {
                ...state,
                user: action.user,
                status: 'authenticated',
            };
        }
        case 'SET_WORKSPACE': {
            return {
                ...state,
                workspace: action.workspace,
            };
        }
        case 'UPDATE_USER': {
            return {
                ...state,
                user: action.user,
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
