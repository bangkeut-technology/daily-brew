import { AuthenticationAction, AuthenticationState } from '@/contexts/authentication-context';

export const authenticationInitialState: AuthenticationState = {
    isAuthenticated: false,
    demo: false,
    user: undefined,
};
export const authenticationReducer = (state: AuthenticationState, action: AuthenticationAction) => {
    switch (action.type) {
        case 'SIGN_IN': {
            const { user } = action;
            return {
                ...state,
                user: action.user,
                isAuthenticated: true,
                demo: user.roles.includes('ROLE_DEMO'),
            };
        }
        case 'SIGN_OUT':
            return { ...state, user: undefined };
    }
    return state;
};
