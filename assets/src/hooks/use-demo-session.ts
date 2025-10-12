import { useContext } from 'react';
import { DemoSessionContextDispatch, DemoSessionContextState } from '@/contexts/demo-session-context';

export const useDemoSessionState = () => {
    const context = useContext(DemoSessionContextState);
    if (!context) {
        throw new Error('useDemoSessionState must be used within a DemoSessionProvider');
    }
    return context;
};

export const useDemoSessionDispatch = () => {
    const context = useContext(DemoSessionContextDispatch);
    if (!context) {
        throw new Error('useDemoSessionDispatch must be used within a DemoSessionProvider');
    }
    return context;
};

