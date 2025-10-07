import { getOrCreateDemoDeviceId } from '@/lib/demo-device';
import { DemoSession } from '@/types/demo-session';
import { apiAxios } from '@/lib/apiAxios';

export const startDemoSession = async () => {
    return apiAxios
        .post<{ message: string; demoSession: DemoSession }>('/demo/start', { deviceId: getOrCreateDemoDeviceId() })
        .then((response) => response.data);
};
