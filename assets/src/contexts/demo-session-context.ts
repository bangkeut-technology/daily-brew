import React from 'react';
import { DemoSessionAction, DemoSessionState } from '@/types/demo-session';

export const DemoSessionContextState = React.createContext<DemoSessionState>({
    demoSession: undefined,
});

export const DemoSessionContextDispatch = React.createContext<React.Dispatch<DemoSessionAction>>(() => {});
