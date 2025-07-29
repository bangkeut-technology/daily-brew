import React from 'react';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/table-core';
import { DataTable } from '@/components/data-table';
import { EvaluationTemplateCriteria } from '@/types/evaluation-template-criterias';
import { RowSelectionState } from '@tanstack/react-table';
import { RemoveTemplateCriteriaButton } from '@/components/button/remove-template-criteria-button';

const columnHelper = createColumnHelper<EvaluationTemplateCriteria>();

interface EvaluationCriteriaTemplateDataTableProps {
    templates: EvaluationTemplateCriteria[];
    loading: boolean;
    onRemoveTemplate: () => void;
}

export const EvaluationCriteriaTemplateDataTable: React.FunctionComponent<EvaluationCriteriaTemplateDataTableProps> = ({
    templates,
    loading,
    onRemoveTemplate,
}) => {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const { t } = useTranslation('glossary');

    const columns = React.useMemo(
        () => [
            columnHelper.accessor('template.name', {
                header: t('evaluation_criterias.table.label'),
                cell: (info) => info.getValue(),
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
            columnHelper.accessor('publicId', {
                header: t('evaluation_criterias.table.actions'),
                cell: (info) => (
                    <RemoveTemplateCriteriaButton
                        title={t('evaluation_criterias.remove.title')}
                        description={t('evaluation_criterias.remove.description')}
                        confirmationText={t('evaluation_criterias.remove.confirm')}
                        publicId={info.getValue()}
                        onRemove={onRemoveTemplate}
                    />
                ),
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
        ],
        [onRemoveTemplate, t],
    );

    return (
        <DataTable
            data={templates}
            columns={columns}
            loading={loading}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
        />
    );
};

EvaluationCriteriaTemplateDataTable.displayName = 'EvaluationCriteriaTemplateDataTable';
