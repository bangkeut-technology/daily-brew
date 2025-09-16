import { apiAxios } from '@/lib/apiAxios';

type Metrics = {
    averageKpi: number;
    attendanceRate: number;
    totalEmployees: number;
    leavesToday: number;
    rangeDays: number;
};

export const fetchMetrics = async ({ from, to }: { from: string; to: string }) => {
    return apiAxios.get<Metrics>('/commons/metrics', { params: { from, to } }).then((response) => response.data);
};
