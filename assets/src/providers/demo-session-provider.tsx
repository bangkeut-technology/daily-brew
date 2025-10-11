import React from 'react';
import { DemoSessionContextDispatch, DemoSessionContextState } from '@/contexts/demo-session-context';
import { demoSessionInitialState, demoSessionReducer } from '@/reducers/demo-session-reducer';

interface DemoSessionProviderProps {
    children: React.ReactNode;
}

export const DemoSessionProvider: React.FC<DemoSessionProviderProps> = ({ children }) => {
    const [state, dispatch] = React.useReducer(demoSessionReducer, demoSessionInitialState);
    return (
        <DemoSessionContextState.Provider value={state}>
            <DemoSessionContextDispatch.Provider value={dispatch}>{children}</DemoSessionContextDispatch.Provider>
        </DemoSessionContextState.Provider>
    );
};
