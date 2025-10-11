import { DemoSessionAction, DemoSessionState } from '@/types/demo-session';

export const demoSessionInitialState: DemoSessionState = {
    demoSession: undefined,
};

export const demoSessionReducer = (state: DemoSessionState, action: DemoSessionAction) => {
    switch (action.type) {
        case 'SET_DEMO_SESSION':
            return { ...state, demoSession: action.payload };
        default:
            return state;
    }
};
