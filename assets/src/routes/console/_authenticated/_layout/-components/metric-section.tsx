import React from 'react';
import { CalendarDays, ClipboardList, TrendingUp, Users } from 'lucide-react';
import { MetricCard } from '@/components/card/metric-card';
import { useQuery } from '@tanstack/react-query';
import { fetchMetrics } from '@/services/common';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { DATE_FORMAT } from '@/constants/date';

interface MetricSectionProps {
    month: Date;
}

export const MetricSection: React.FunctionComponent<MetricSectionProps> = ({ month }) => {
    const start = React.useMemo(() => startOfMonth(month), [month]);
    const end = React.useMemo(() => endOfMonth(month), [month]);
    const { data } = useQuery({
        queryKey: ['common-metrics', start, end],
        queryFn: () => fetchMetrics({ from: format(start, DATE_FORMAT), to: format(end, DATE_FORMAT) }),
    });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Avg KPI"
                value={data?.averageKpi.toFixed(2) || '0'}
                suffix="/ 5"
            />
            <MetricCard
                icon={<CalendarDays className="h-4 w-4" />}
                label="Attendance"
                value={`${data?.attendanceRate}%`}
            />
            <MetricCard icon={<Users className="h-4 w-4" />} label="Employees" value={String(data?.totalEmployees)} />
            <MetricCard
                icon={<ClipboardList className="h-4 w-4" />}
                label="On leave today"
                value={String(data?.leavesToday)}
            />
        </div>
    );
};
