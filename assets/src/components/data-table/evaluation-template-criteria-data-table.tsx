import React from 'react';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/table-core';
import { DataTable } from '@/components/data-table';
import { EvaluationTemplateCriteria } from '@/types/evaluation-template-criterias';
import { RowSelectionState } from '@tanstack/react-table';
import { RemoveTemplateCriteriaButton } from '@/components/button/remove-template-criteria-button';

const columnHelper = createColumnHelper<EvaluationTemplateCriteria>();

interface EvaluationTemplateCriteriaDataTableProps {
    criterias: EvaluationTemplateCriteria[];
    loading: boolean;
    onRemoveCriteria: (identifier: string) => void;
}

export const EvaluationTemplateCriteriaDataTable: React.FunctionComponent<EvaluationTemplateCriteriaDataTableProps> = ({
    criterias,
    loading,
}) => {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const { t } = useTranslation('glossary');

    const columns = React.useMemo(
        () => [
            columnHelper.accessor('criteria.label', {
                header: t('evaluation_criterias.table.label'),
                cell: (info) => info.getValue(),
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
            columnHelper.accessor('weight', {
                header: t('evaluation_criterias.table.weight'),
                cell: (info) => info.getValue(),
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
            columnHelper.accessor('identifier', {
                header: t('evaluation_criterias.table.actions'),
                cell: (info) => <RemoveTemplateCriteriaButton identifier={info.getValue()} />,
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
            data={criterias}
            columns={columns}
            loading={loading}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
        />
    );
};

EvaluationTemplateCriteriaDataTable.displayName = 'EvaluationTemplateCriteriaDataTable';
