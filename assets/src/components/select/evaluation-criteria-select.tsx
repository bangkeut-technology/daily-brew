import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEvaluationCriterias } from '@/services/evaluation-criteria';
import { createColumnHelper } from '@tanstack/table-core';
import { EvaluationCriteria } from '@/types/evaluation-criteria';
import { Checkbox } from '@/components/ui/checkbox';
import { Table } from '@/components/table';
import { RowSelectionState } from '@tanstack/react-table';
import { Control, useFieldArray } from 'react-hook-form';
import { NewEvaluationCriteriaDialog } from '@/components/dialog/new-evaluation-criteria-dialog';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<EvaluationCriteria>();
const queryKey = ['daily-brew-evaluationCriterias'];

interface EvaluationCriteriaSelectProps {
    control: Control<any>;
    name: string;
    title?: string;
    description?: string;
}

export const EvaluationCriteriaSelect: React.FunctionComponent<EvaluationCriteriaSelectProps> = ({
    control,
    name,
    title,
    description,
}) => {
    const { t } = useTranslation('glossary');
    const [evaluationCriterias, setEvaluationCriterias] = React.useState<RowSelectionState>({});
    const { replace } = useFieldArray({
        name,
        control,
    });
    const { data = [] } = useQuery({
        queryKey,
        queryFn: () => fetchEvaluationCriterias(),
    });

    React.useEffect(() => {
        const selectedRows = Object.keys(evaluationCriterias).map((value) => data[Number(value)]);
        replace(selectedRows.map((evaluationCriteria) => ({ value: evaluationCriteria.id })));
    }, [data, replace, evaluationCriterias]);

    const columns = React.useMemo(
        () => [
            columnHelper.accessor('id', {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
            columnHelper.accessor('label', {
                header: t('evaluation_criterias.label'),
                cell: (info) => info.getValue(),
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
        <div className="flex flex-col space-y-4">
            <div className="flex flex-row space-x-4">
                {title && <h3 className="text-lg font-semibold">{title}</h3>}
                <NewEvaluationCriteriaDialog queryKey={queryKey} />
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <Table
                data={data}
                columns={columns}
                rowSelection={evaluationCriterias}
                onRowSelectionChange={setEvaluationCriterias}
            />
        </div>
    );
};
