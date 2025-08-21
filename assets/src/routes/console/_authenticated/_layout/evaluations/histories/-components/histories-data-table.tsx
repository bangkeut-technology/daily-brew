import React from 'react';
import { createColumnHelper } from '@tanstack/table-core';
import { EmployeeEvaluation } from '@/types/employee-evaluation';
import { DataTable } from '@/components/data-table';
import { useTranslation } from 'react-i18next';
import { RowSelectionState } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { fetchEmployeeEvaluations } from '@/services/employee-evaluation';
import { format } from 'date-fns';
import { DISPLAY_DATE_FORMAT } from '@/constants/date';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { HistoriesSearchParams } from '@/routes/console/_authenticated/_layout/evaluations/histories/-components/history-search-form';

const columnHelper = createColumnHelper<EmployeeEvaluation>();

interface HistoriesDataTableProps {
    params: HistoriesSearchParams;
}

export const HistoriesDataTable: React.FunctionComponent<HistoriesDataTableProps> = ({ params }) => {
    const { t } = useTranslation();
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const { data = [], isFetching } = useQuery({
        queryKey: ['employee-evaluations', params],
        queryFn: () => fetchEmployeeEvaluations(params),
    });

    const columns = React.useMemo(
        () => [
            columnHelper.accessor('evaluatedAt', {
                header: t('evaluated_on'),
                cell: ({ row }) => format(row.original.evaluatedAt, DISPLAY_DATE_FORMAT),
                enableSorting: true,
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
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
            columnHelper.accessor('evaluator.fullName', {
                header: t('evaluator'),
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
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
        ],
        [t],
    );

    return (
        <DataTable
            data={data}
            columns={columns}
            loading={isFetching}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
        />
    );
};
