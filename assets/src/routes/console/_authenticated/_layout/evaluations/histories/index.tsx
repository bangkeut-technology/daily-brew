import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { cn } from '@/lib/utils';
import { fetchEmployeeEvaluations } from '@/services/employee-evaluation';
import { EmployeeEvaluation } from '@/types/employee-evaluation';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/table-core';
import { DISPLAY_DATE_FORMAT } from '@/constants/date';
import { RowSelectionState } from '@tanstack/react-table';

const columnHelper = createColumnHelper<EmployeeEvaluation>();

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/history')({
    component: EvaluationsHistoryPage,
});

function EvaluationsHistoryPage() {
    const { t } = useTranslation();
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const { data = [], isFetching } = useQuery({
        queryKey: ['employee-evaluations'],
        queryFn: () => fetchEmployeeEvaluations(),
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

    const onExportCsv = React.useCallback(() => {}, []);

    return (
        <div className="w-full px-6 py-5 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold">Evaluation History</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onExportCsv}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Results {isFetching && <span className="text-xs text-muted-foreground">• Loading…</span>}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={data}
                        columns={columns}
                        loading={isFetching}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
