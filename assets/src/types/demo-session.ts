import { User } from '@/types/user';

export type DemoSession = {
    id: number;
    publicId: string;
    deviceId: string;
    expiresAt: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    user: User;
};

export type DemoSessionAction = { type: 'SET_DEMO_SESSION'; payload: DemoSession };

export type DemoSessionState = {
    demoSession: DemoSession | undefined;
};
