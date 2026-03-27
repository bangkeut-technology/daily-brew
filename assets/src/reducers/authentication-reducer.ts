import type { AuthenticationState } from '@/contexts/authentication-context';
import type { User, Workspace } from '@/types/user';

export type AuthenticationAction =
    | { type: 'SIGN_IN'; user: User; workspace: Workspace | null }
    | { type: 'SIGN_OUT' }
    | { type: 'SET_WORKSPACE'; workspace: Workspace }
    | { type: 'LOADING' };

export const initialAuthenticationState: AuthenticationState = {
    status: 'loading',
    user: null,
    workspace: null,
};

export function authenticationReducer(
    state: AuthenticationState,
    action: AuthenticationAction,
): AuthenticationState {
    switch (action.type) {
        case 'SIGN_IN':
            return {
                status: 'authenticated',
                user: action.user,
                workspace: action.workspace,
            };
        case 'SIGN_OUT':
            return {
                status: 'unauthenticated',
                user: null,
                workspace: null,
            };
        case 'SET_WORKSPACE':
            return {
                ...state,
                workspace: action.workspace,
            };
        case 'LOADING':
            return {
                ...state,
                status: 'loading',
            };
        default:
            return state;
    }
}
