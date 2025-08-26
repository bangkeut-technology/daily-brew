import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CalendarDays, Download, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// —————————————————————————————————————————
// Types (align with backend)
type AttendanceStatus = 'present' | 'absent' | 'leave' | 'late' | 'sick' | 'holiday' | 'remote';

type EmployeeLite = {
    id: string;
    publicId: string;
    firstName: string;
    lastName: string;
};

type AttendanceRecord = {
    id: string;
    employee: EmployeeLite;
    attendanceDate: string; // ISO 'yyyy-MM-dd'
    status: AttendanceStatus;
    clockIn?: string; // 'HH:mm'
    clockOut?: string; // 'HH:mm'
    note?: string;
    createdAt?: string; // ISO
};

// —————————————————————————————————————————
// Status badge meta (colors consistent with your app)
const STATUS_COLORS: Record<AttendanceStatus, string> = {
    present: 'bg-emerald-500 text-white',
    late: 'bg-amber-500 text-black',
    absent: 'bg-rose-500 text-white',
    leave: 'bg-amber-400 text-black',
    sick: 'bg-sky-500 text-white',
    remote: 'bg-violet-500 text-white',
    holiday: 'bg-indigo-500 text-white',
};

// —————————————————————————————————————————
// Route (URL-synced filters)
export const Route = createFileRoute('/console/_authenticated/_layout/attendances/list')({
    component: AttendanceListPage,
    validateSearch: z.object({
        from: z.string().optional(), // 'yyyy-MM-dd'
        to: z.string().optional(), // 'yyyy-MM-dd'
        employeeId: z.string().optional().default(''),
        status: z
            .enum(['present', 'absent', 'leave', 'late', 'sick', 'holiday', 'remote'])
            .optional()
            .or(z.literal(''))
            .default(''),
        q: z.string().optional().default(''),
        page: z.coerce.number().min(1).optional().default(1),
        limit: z.coerce.number().min(5).max(100).optional().default(20),
    }),
});

// —————————————————————————————————————————
// Replace with your real queries
function useEmployees(): { data: EmployeeLite[]; isLoading: boolean } {
    // Example: useQuery(['employees:lite'], fetchEmployeesLite)
    const data = React.useMemo<EmployeeLite[]>(
        () => [
            { id: 'e1', publicId: 'emp_1', firstName: 'Sovan', lastName: 'Kim' },
            { id: 'e2', publicId: 'emp_2', firstName: 'Chanthy', lastName: 'Long' },
            { id: 'e3', publicId: 'emp_3', firstName: 'Mey', lastName: 'Sok' },
        ],
        [],
    );
    return { data, isLoading: false };
}

type AttendanceListResponse = {
    rows: AttendanceRecord[];
    total: number;
};

async function fetchAttendanceList(params: {
    from?: string;
    to?: string;
    employeeId?: string;
    status?: string;
    q?: string;
    page: number;
    limit: number;
}): Promise<AttendanceListResponse> {
    // TODO: replace with real API call:
    // const res = await fetch(`/api/attendances?${new URLSearchParams({...})}`);
    // return res.json();
    const { page, limit } = params;
    const all: AttendanceRecord[] = [
        {
            id: 'a1',
            employee: { id: 'e1', publicId: 'emp_1', firstName: 'Sovan', lastName: 'Kim' },
            attendanceDate: '2025-08-01',
            status: 'present',
            clockIn: '08:02',
            clockOut: '16:30',
            note: '',
            createdAt: '2025-08-01T01:00:00Z',
        },
        {
            id: 'a2',
            employee: { id: 'e2', publicId: 'emp_2', firstName: 'Chanthy', lastName: 'Long' },
            attendanceDate: '2025-08-01',
            status: 'leave',
            note: 'Family',
            createdAt: '2025-08-01T01:05:00Z',
        },
        {
            id: 'a3',
            employee: { id: 'e3', publicId: 'emp_3', firstName: 'Mey', lastName: 'Sok' },
            attendanceDate: '2025-08-02',
            status: 'late',
            clockIn: '08:25',
            createdAt: '2025-08-02T01:00:00Z',
        },
    ];
    const start = (page - 1) * limit;
    return {
        rows: all.slice(start, start + limit),
        total: all.length,
    };
}

// —————————————————————————————————————————
// Page
function AttendanceListPage() {
    const { from, to, employeeId, status, q, page, limit } = Route.useSearch();
    const navigate = Route.useNavigate();

    // Filters state (URL-synced)
    const [localFrom, setLocalFrom] = React.useState<string>(from || '');
    const [localTo, setLocalTo] = React.useState<string>(to || '');
    const [localEmployee, setLocalEmployee] = React.useState<string>(employeeId || '');
    const [localStatus, setLocalStatus] = React.useState<string>(status || '');
    const [localQ, setLocalQ] = React.useState<string>(q || '');

    // Employees for the filter
    const { data: employees } = useEmployees();

    // Data query
    const { data, isFetching } = useQuery({
        queryKey: ['attendance:list', { from, to, employeeId, status, q, page, limit }],
        queryFn: () => fetchAttendanceList({ from, to, employeeId, status, q, page, limit }),
    });

    // Handlers
    const applyFilters = React.useCallback(() => {
        navigate({
            to: Route.fullPath,
            search: {
                from: localFrom || undefined,
                to: localTo || undefined,
                employeeId: localEmployee || '',
                status: localStatus || '',
                q: localQ || '',
                page: 1, // reset to first page on new filter
                limit,
            },
            replace: true,
        });
    }, [localFrom, localTo, localEmployee, localStatus, localQ, limit, navigate]);

    const resetFilters = React.useCallback(() => {
        setLocalFrom('');
        setLocalTo('');
        setLocalEmployee('');
        setLocalStatus('');
        setLocalQ('');
        navigate({ to: Route.fullPath, search: { page: 1, limit }, replace: true });
    }, [limit, navigate]);

    const setPage = (p: number) =>
        navigate({ to: Route.fullPath, search: { from, to, employeeId, status, q, page: p, limit }, replace: true });

    const setLimit = (l: number) =>
        navigate({ to: Route.fullPath, search: { from, to, employeeId, status, q, page: 1, limit: l }, replace: true });

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

            {/* Table */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Results</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="sticky top-0 bg-muted/40 backdrop-blur z-10 text-left text-muted-foreground border-y">
                                    <th className="px-3 py-2">Date</th>
                                    <th className="px-3 py-2">Employee</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Clock in</th>
                                    <th className="px-3 py-2">Clock out</th>
                                    <th className="px-3 py-2">Note</th>
                                    <th className="px-3 py-2">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {(data?.rows ?? []).map((r) => (
                                    <tr key={r.id} className="hover:bg-muted/30">
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {format(parseISO(r.attendanceDate), 'PPP')}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {r.employee.firstName} {r.employee.lastName}
                                        </td>
                                        <td className="px-3 py-2">
                                            <Badge className={cn('px-2 py-0.5', STATUS_COLORS[r.status])}>
                                                {r.status}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2">{r.clockIn ?? '—'}</td>
                                        <td className="px-3 py-2">{r.clockOut ?? '—'}</td>
                                        <td className="px-3 py-2 max-w-[320px] truncate" title={r.note}>
                                            {r.note ?? '—'}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                                            {r.createdAt ? format(parseISO(r.createdAt), 'PPp') : '—'}
                                        </td>
                                    </tr>
                                ))}
                                {(!data || data.rows.length === 0) && (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                                            {isFetching ? 'Loading…' : 'No attendance found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Separator className="my-3" />

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 pb-4">
                        <div className="text-xs text-muted-foreground">
                            {data?.total ?? 0} total • Page {page} • Showing {limit} per page
                        </div>

                        <div className="flex items-center gap-2">
                            <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                                <SelectTrigger className="w-[110px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 20, 50, 100].map((n) => (
                                        <SelectItem key={n} value={String(n)}>
                                            {n} / page
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page <= 1}
                                >
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={!!data && page >= Math.max(1, Math.ceil(data.total / limit))}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
