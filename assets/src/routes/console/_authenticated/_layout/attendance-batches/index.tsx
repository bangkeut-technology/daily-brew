import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import { AttendanceSearchParams } from '@/types/attendance';
import { AttendanceBatchDataTable } from '@/routes/console/_authenticated/_layout/attendance-batches/-components/attendance-batch-data-table';
import { AttendanceBatchSearchForm } from '@/routes/console/_authenticated/_layout/attendance-batches/-components/attendance-batch-search-form';

export const Route = createFileRoute('/console/_authenticated/_layout/attendance-batches/')({
    component: AttendanceListPage,
    validateSearch: z.object({
        name: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        employee: z.string().optional(),
        type: z
            .enum(['present', 'absent', 'leave', 'late', 'sick', 'holiday', 'closure', 'remote', 'unknown'])
            .optional(),
    }),
});

function AttendanceListPage() {
    const { name, from, to, type } = Route.useSearch();
    const navigate = Route.useNavigate();

    const onChange = React.useCallback(
        (patch: Partial<AttendanceSearchParams>) => {
            navigate({
                to: Route.fullPath,
                search: { from, to, name, type, ...patch },
                replace: true,
            });
        },
        [navigate, from, to, name, type],
    );

    return (
        <div className="w-full px-6 py-5 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <CalendarDays className="h-4 w-4" />
                    </span>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Attendance Batches — Raw List</h1>
                        <p className="text-sm text-muted-foreground">Filter, search, and review entries</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <AttendanceBatchSearchForm from={from} to={to} name={name} type={type} onChange={onChange} />

            {/* Table */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Results</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <AttendanceBatchDataTable params={{ to, name, type, from }} />
                </CardContent>
            </Card>
        </div>
    );
}
