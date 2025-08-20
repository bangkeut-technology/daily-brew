import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Calendar, Download, ListFilter, Search } from 'lucide-react';
import { DateRangePicker } from '@/components/picker/date-range-picker'; // or your DateRange component
import { DataTable } from '@/components/data-table'; // your wrapper around shadcn table
import { cn } from '@/lib/utils';
import { fetchEmployeeEvaluations } from '@/services/employee-evaluation';
import { ColumnDef } from '@tanstack/react-table';
import { EmployeeEvaluation } from '@/types/employee-evaluation';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/table-core';
import { DISPLAY_DATE_FORMAT } from '@/constants/date';

const columnHelper = createColumnHelper<EmployeeEvaluation>();

// --- Search schema (type-safe route) ---
const SearchSchema = z.object({
    employeeId: z.string().optional(),
    templateId: z.string().optional(),
    from: z.string().optional(), // yyyy-MM-dd
    to: z.string().optional(),
    minAvg: z.coerce.number().optional(),
    maxAvg: z.coerce.number().optional(),
    q: z.string().optional(),
    page: z.coerce.number().default(1),
    pageSize: z.coerce.number().default(20),
    sort: z.string().optional(), // e.g. 'evaluatedAt:desc'
});

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/history')({
    validateSearch: (search) => SearchSchema.parse(search),
    component: EvaluationsHistoryPage,
});

function EvaluationsHistoryPage() {
    const { t } = useTranslation();
    const navigate = Route.useNavigate();

    // Query list
    const params = new URLSearchParams();
    if (employeeId) params.set('employeeId', employeeId);
    if (templateId) params.set('templateId', templateId);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (q) params.set('q', q);
    if (minAvg !== undefined) params.set('minAvg', String(minAvg));
    if (maxAvg !== undefined) params.set('maxAvg', String(maxAvg));
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (sort) params.set('sort', sort);

    const { data, isFetching } = useQuery({
        queryKey: ['employee-evaluations', params],
        queryFn: () => fetchEmployeeEvaluations(params),
    });

    // Table columns
    const columns = React.useMemo(
        () => [
            columnHelper.accessor('evaluatedAt', {
                header: t('evaluated_on'),
                cell: ({ row }) => format(parseISO(row.original.evaluatedAt), DISPLAY_DATE_FORMAT),
                enableSorting: true,
            }),
            columnHelper.accessor('employee.fullName', {
                header: t('employee'),
                cell: ({ getValue }) => getValue(),
                enableSorting: true,
            }),
            columnHelper.accessor('templateName', {
                header: t('template'),
                cell: ({ getValue }) => getValue(),
                enableSorting: true,
            }),
            columnHelper.accessor('averageScore', {
                header: t('average'),
                cell: ({ row }) => (
                    <Badge
                        className={cn(
                            'w-14 justify-center',
                            row.original.averageScore == null
                                ? 'bg-muted text-muted-foreground'
                                : row.original.averageScore >= 4.5
                                  ? 'bg-green-600 text-white'
                                  : row.original.averageScore >= 3.5
                                    ? 'bg-green-500 text-white'
                                    : row.original.averageScore >= 2.5
                                      ? 'bg-yellow-400 text-black'
                                      : row.original.averageScore >= 1.5
                                        ? 'bg-orange-400 text-white'
                                        : 'bg-red-500 text-white',
                        )}
                    >
                        {row.original.averageScore?.toFixed(2) ?? '—'}
                    </Badge>
                ),
                enableSorting: true,
            }),
        ],
        [t],
    );

    // Row details
    const [detailId, setDetailId] = React.useState<string | null>(null);
    const { data: detail } = useQuery({
        queryKey: ['evaluation-detail', detailId],
        queryFn: () => fetchEvaluationDetail(detailId!),
        enabled: !!detailId,
    });

    // Helpers
    const setSearch = (patch: Partial<z.infer<typeof SearchSchema>>) =>
        navigate({ search: (prev) => ({ ...prev, ...patch, page: 1 }) });

    return (
        <div className="w-full px-6 py-5 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold">Evaluation History</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onExportCsv}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <ListFilter className="h-4 w-4" /> Filters
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-6">
                    {/* Employee */}
                    <div className="md:col-span-2">
                        <label className="text-xs text-muted-foreground">Employee</label>
                        <Select
                            value={employeeId ?? ''}
                            onValueChange={(v) => setSearch({ employeeId: v || undefined })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All employees" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All</SelectItem>
                                {employees.map((e) => (
                                    <SelectItem key={e.id} value={e.id}>
                                        {e.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Template */}
                    <div className="md:col-span-2">
                        <label className="text-xs text-muted-foreground">Template</label>
                        <Select
                            value={templateId ?? ''}
                            onValueChange={(v) => setSearch({ templateId: v || undefined })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All templates" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All</SelectItem>
                                {templates.map((t) => (
                                    <SelectItem key={t.id} value={t.id}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date range */}
                    <div className="md:col-span-2">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Date range
                        </label>
                        <DateRangePicker
                            value={from && to ? { from: new Date(from), to: new Date(to) } : undefined}
                            onChange={(range) => {
                                setSearch({
                                    from: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
                                    to: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
                                });
                            }}
                        />
                    </div>

                    {/* Keyword */}
                    <div className="md:col-span-3">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Search className="h-3 w-3" /> Search
                        </label>
                        <Input
                            placeholder="Employee or template…"
                            value={local.q}
                            onChange={(e) => {
                                const v = e.target.value;
                                setLocal((s) => ({ ...s, q: v }));
                                const id = setTimeout(() => setSearch({ q: v || undefined }), 350) as any;
                                return () => clearTimeout(id);
                            }}
                        />
                    </div>

                    {/* Avg range */}
                    <div className="md:col-span-3 grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-muted-foreground">Min avg</label>
                            <Input
                                type="number"
                                min={0}
                                max={5}
                                step={0.1}
                                value={local.minAvg}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setLocal((s) => ({ ...s, minAvg: v }));
                                    const id = setTimeout(
                                        () => setSearch({ minAvg: v ? Number(v) : undefined }),
                                        350,
                                    ) as any;
                                    return () => clearTimeout(id);
                                }}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Max avg</label>
                            <Input
                                type="number"
                                min={0}
                                max={5}
                                step={0.1}
                                value={local.maxAvg}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setLocal((s) => ({ ...s, maxAvg: v }));
                                    const id = setTimeout(
                                        () => setSearch({ maxAvg: v ? Number(v) : undefined }),
                                        350,
                                    ) as any;
                                    return () => clearTimeout(id);
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Results {isFetching && <span className="text-xs text-muted-foreground">• Loading…</span>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable<EvaluationRow>
                        columns={columns}
                        data={data?.rows ?? []}
                        rowCount={data?.total ?? 0}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={(p) => navigate({ search: (s) => ({ ...s, page: p }) })}
                        onPageSizeChange={(ps) => navigate({ search: (s) => ({ ...s, pageSize: ps, page: 1 }) })}
                        onSortChange={(key, dir) =>
                            navigate({ search: (s) => ({ ...s, sort: key ? `${key}:${dir}` : undefined }) })
                        }
                        onRowClick={(row) => setDetailId(row.id)}
                    />
                </CardContent>
            </Card>

            {/* Details drawer */}
            <Sheet open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
                <SheetContent className="sm:max-w-xl overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Evaluation details</SheetTitle>
                    </SheetHeader>

                    {detail ? (
                        <div className="space-y-4 py-2">
                            <div className="text-sm text-muted-foreground">
                                {format(parseISO(detail.evaluatedAt), 'PPP')} • {detail.employeeName}
                                {detail.templateName ? ` • ${detail.templateName}` : ''}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">Average:</span>
                                <Badge>{detail.averageScore?.toFixed(2) ?? '—'}</Badge>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                {detail.scores.map((s) => (
                                    <div key={s.criteriaId} className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-medium">{s.criteriaLabel}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Weight {s.weight} • {s.type === 'boolean' ? 'Yes/No' : '0–5'}
                                            </div>
                                            {s.note ? <div className="text-xs mt-1">Note: {s.note}</div> : null}
                                        </div>
                                        <Badge variant="secondary" className="min-w-[3rem] justify-center">
                                            {s.score ?? '—'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                            {detail.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <div className="text-sm font-medium mb-1">General notes</div>
                                        <div className="text-sm whitespace-pre-wrap">{detail.notes}</div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 text-sm text-muted-foreground">Loading…</div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
