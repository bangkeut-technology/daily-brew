import { AuthenticationAction, AuthenticationState } from '@/contexts/authentication-context';

export const authenticationInitialState: AuthenticationState = {
    isAuthenticated: false,
    demo: false,
    user: undefined,
};
export const authenticationReducer = (state: AuthenticationState, action: AuthenticationAction) => {
    switch (action.type) {
        case 'LOGIN': {
            const { user } = action;
            return {
                ...state,
                user: action.user,
                isAuthenticated: true,
                demo: user.roles.includes('ROLE_DEMO'),
            };
        }
        case 'LOGOUT':
            return { ...state, user: undefined };
    }
    return state;
};
