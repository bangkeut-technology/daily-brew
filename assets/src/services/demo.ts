import { getOrCreateDemoDeviceId } from '@/lib/demo-device';
import axios from 'axios';
import { DemoSession } from '@/types/demo-session';

export const startDemoSession = async () => {
    return axios
        .post<{ message: string; demoSession: DemoSession }>('/demo/start', { deviceId: getOrCreateDemoDeviceId() })
        .then((response) => response.data);
};
