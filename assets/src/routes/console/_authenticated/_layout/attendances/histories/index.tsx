import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Download } from 'lucide-react';
import { AttendanceDataTable } from '@/routes/console/_authenticated/_layout/attendances/histories/-components/attendance-data-table';
import { SearchForm } from '@/routes/console/_authenticated/_layout/attendances/histories/-components/search-form';
import { AttendanceSearchParams } from '@/services/attendance';

export const Route = createFileRoute('/console/_authenticated/_layout/attendances/histories/')({
    component: AttendanceListPage,
    validateSearch: z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        employee: z.string().optional(),
        status: z.enum(['present', 'absent', 'leave', 'late', 'sick', 'holiday', 'remote', 'unknown']).optional(),
    }),
});

function AttendanceListPage() {
    const { from, to, employee, status } = Route.useSearch();
    const navigate = Route.useNavigate();

    const onChange = React.useCallback(
        (patch: Partial<AttendanceSearchParams>) => {
            navigate({
                to: Route.fullPath,
                search: { from, to, employee, status, ...patch },
                replace: true,
            });
        },
        [navigate, from, to, employee, status],
    );

    const isPro = false; // TODO: wire to your plan/feature gate

    return (
        <div className="w-full px-6 py-5 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <CalendarDays className="h-4 w-4" />
                    </span>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Attendance — Raw List</h1>
                        <p className="text-sm text-muted-foreground">Filter, search, and review entries</p>
                    </div>
                </div>
                <Button variant={isPro ? 'default' : 'outline'} disabled={!isPro}>
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                    {!isPro && (
                        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            Pro
                        </span>
                    )}
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Filters</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-5">
                    <SearchForm from={from} to={to} employee={employee} status={status} onChange={onChange} />
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Results</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <AttendanceDataTable params={{ to, employee, status, from }} />
                </CardContent>
            </Card>
        </div>
    );
}
