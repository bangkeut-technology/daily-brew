import React from 'react';
import { CalendarDays, ClipboardList, TrendingUp, Users } from 'lucide-react';
import { MetricCard } from '@/components/card/metric-card';
import { useQuery } from '@tanstack/react-query';

interface MetricSectionProps {
    month: Date;
}

export const MetricSection: React.FunctionComponent<MetricSectionProps> = () => {
    const { data } = useQuery({
        queryKey: ['metrics', new Date().toISOString().split('T')[0]],
        queryFn: () => fetch('/api/metrics').then((res) => res.json()),
    });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Avg KPI"
                value={data?.avgKpi.toFixed(2)}
                suffix="/ 5"
            />
            <MetricCard
                icon={<CalendarDays className="h-4 w-4" />}
                label="Attendance"
                value={`${data?.attendanceRate}%`}
            />
            <MetricCard icon={<Users className="h-4 w-4" />} label="Employees" value={String(data?.employees)} />
            <MetricCard
                icon={<ClipboardList className="h-4 w-4" />}
                label="On leave today"
                value={String(data?.leavesToday)}
            />
        </div>
    );
};
