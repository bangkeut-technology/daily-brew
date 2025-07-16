import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { fetchEvaluationTemplates } from '@/services/evaluation-template';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, Eye, ListPlus } from 'lucide-react';
import { Table } from '@/components/table';
import { createColumnHelper } from '@tanstack/table-core';
import { EvaluationTemplate } from '@/types/evaluation-template';
import { useTranslation } from 'react-i18next';
import { RowSelectionState } from '@tanstack/react-table';
import { EvaluationSwitch } from '@/components/switch/evaluations-switch';

const columnHelper = createColumnHelper<EvaluationTemplate>();

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/templates/')({
    component: Evaluations,
    loader: () => fetchEvaluationTemplates(),
});

function Evaluations() {
    const { t } = useTranslation();
    const data = Route.useLoaderData();
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const columns = React.useMemo(
        () => [
            columnHelper.accessor('identifier', {
                id: 'view',
                header: () => t('view'),
                cell: ({ getValue }) => (
                    <Button size="icon" variant="ghost" asChild>
                        <Link to={`/console/evaluations/templates/$identifier`} params={{ identifier: getValue() }}>
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
            columnHelper.accessor('name', {
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        {t('name')}
                        {column.getIsSorted() === 'asc' ? <ArrowUp /> : <ArrowDown />}
                    </Button>
                ),
                cell: (info) => info.renderValue(),
                footer: (info) => info.column.id,
            }),
            columnHelper.accessor('active', {
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        {t('active')}
                        {column.getIsSorted() === 'asc' ? <ArrowUp /> : <ArrowDown />}
                    </Button>
                ),
                cell: (info) => <EvaluationSwitch evaluation={info.row.original} />,
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
                        <Link to="/console/evaluations/templates/new">
                            <ListPlus /> {t('new.evaluation_template.title', { ns: 'glossary' })}
                        </Link>
                    </Button>
                </div>
            </div>
            <Table data={data} columns={columns} onRowSelectionChange={setRowSelection} rowSelection={rowSelection} />
        </div>
    );
}
