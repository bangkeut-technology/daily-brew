import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEvaluationTemplates } from '@/services/evaluation-template';
import { createColumnHelper } from '@tanstack/table-core';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/data-table';
import { RowSelectionState } from '@tanstack/react-table';
import { Control, useFieldArray } from 'react-hook-form';
import { NewEvaluationTemplateDialog } from '@/components/dialog/new-evaluation-template-dialog';
import { useTranslation } from 'react-i18next';
import { EvaluationTemplate } from '@/types/evaluation-template';

const columnHelper = createColumnHelper<EvaluationTemplate>();
const queryKey = ['daily-brew-evaluation-templates'];

interface EvaluationTemplateMultiSelectProps {
    control: Control<any>;
    name: string;
    title?: string;
    description?: string;
}

export const EvaluationTemplateMultiSelect: React.FunctionComponent<EvaluationTemplateMultiSelectProps> = ({
    control,
    name,
    title,
    description,
}) => {
    const { t } = useTranslation('glossary');
    const [evaluationTemplates, setEvaluationTemplates] = React.useState<RowSelectionState>({});
    const { replace } = useFieldArray({
        name,
        control,
    });
    const { data = [], isPending } = useQuery({
        queryKey,
        queryFn: () => fetchEvaluationTemplates(),
    });

    React.useEffect(() => {
        const selectedRows = Object.keys(evaluationTemplates).map((value) => data[Number(value)]);
        replace(selectedRows.map((evaluationTemplate) => ({ value: evaluationTemplate.id })));
    }, [data, replace, evaluationTemplates]);

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
            columnHelper.accessor('name', {
                header: t('evaluation_templates.table.name', { ns: 'glossary' }),
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
                <NewEvaluationTemplateDialog queryKey={queryKey} />
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <DataTable
                data={data}
                columns={columns}
                rowSelection={evaluationTemplates}
                onRowSelectionChange={setEvaluationTemplates}
                loading={isPending}
            />
        </div>
    );
};

EvaluationTemplateMultiSelect.displayName = 'EvaluationTemplateMultiSelect';
