import { getOrCreateDemoDeviceId } from '@/lib/demo-device';
import axios from 'axios';

export async function startDemoSession() {
    return axios.post('/demo/start', { deviceId: getOrCreateDemoDeviceId() }).then((response) => response.data);
}
