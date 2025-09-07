import { apiAxios } from '@/lib/apiAxios';

export const fetchMetrics = async ({ from, to }: { from: string; to: string }) => {
    return apiAxios.get('/commons/metrics', { params: { from, to } }).then((response) => response.data);
};
