import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { fetchEvaluationCriterias } from '@/services/evaluation-criteria';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, Eye, ListPlus } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { createColumnHelper } from '@tanstack/table-core';
import { EvaluationCriteria } from '@/types/evaluation-criteria';
import { useTranslation } from 'react-i18next';
import { RowSelectionState } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';

const columnHelper = createColumnHelper<EvaluationCriteria>();

export const Route = createFileRoute('/console/_authenticated/_layout/manage/criterias/')({
    component: EvaluationCriterias,
});

function EvaluationCriterias() {
    const { t } = useTranslation();
    const { data = [], isPending } = useQuery({
        queryKey: ['evaluation-criterias'],
        queryFn: () => fetchEvaluationCriterias(),
    });
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const columns = React.useMemo(
        () => [
            columnHelper.accessor('publicId', {
                id: 'view',
                header: () => t('view'),
                cell: ({ getValue }) => (
                    <Button size="icon" variant="ghost" asChild>
                        <Link to={`/console/evaluations/criterias/$publicId`} params={{ publicId: getValue() }}>
                            <Eye />
                        </Link>
                    </Button>
                ),
                footer: (info) => info.column.id,
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
            columnHelper.accessor('label', {
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        {t('name')}
                        {column.getIsSorted() === 'asc' ? <ArrowUp /> : <ArrowDown />}
                    </Button>
                ),
                cell: (info) => info.renderValue(),
                footer: (info) => info.column.id,
            }),
            columnHelper.accessor('weight', {
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        {t('evaluation_criterias.table.weight', { ns: 'glossary' })}
                        {column.getIsSorted() === 'asc' ? <ArrowUp /> : <ArrowDown />}
                    </Button>
                ),
                cell: (info) => info.getValue(),
                footer: (info) => info.column.id,
            }),
        ],
        [t],
    );

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="py-4 border rounded-lg p-2 space-y-2 mb-2">
                <div className="flex flex-row justify-center items-center space-x-2">
                    <Button asChild>
                        <Link to="/console/evaluations/criterias/new">
                            <ListPlus /> {t('evaluation_criterias.new.title', { ns: 'glossary' })}
                        </Link>
                    </Button>
                </div>
            </div>
            <DataTable
                data={data}
                columns={columns}
                onRowSelectionChange={setRowSelection}
                rowSelection={rowSelection}
                loading={isPending}
            />
        </div>
    );
}
