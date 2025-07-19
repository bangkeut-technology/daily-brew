import React from 'react';
import { EvaluationTemplate } from '@/types/evaluation-template';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/components/data-table';
import { useQuery } from '@tanstack/react-query';
import { fetchTemplateCriterias } from '@/services/evaluation-template';
import { createColumnHelper } from '@tanstack/table-core';
import { EvaluationTemplateCriteria } from '@/types/evaluation-template-criterias';

const columnHelper = createColumnHelper<EvaluationTemplateCriteria>();

interface EvaluationTemplateCriteriasProps {
    template: EvaluationTemplate;
}

export const EvaluationTemplateCriterias: React.FunctionComponent<EvaluationTemplateCriteriasProps> = ({
    template,
}) => {
    const { t } = useTranslation();
    const { data = [] } = useQuery({
        queryKey: ['evaluation-template-criterias', template.identifier],
        queryFn: async () => fetchTemplateCriterias(template.identifier),
    });

    const columns = React.useMemo(
        () => [
            columnHelper.accessor('criteria.label', {
                header: () => t('evaluation_criterias.table.label', { ns: 'glossary' }),
                cell: (info) => info.getValue(),
                footer: (info) => info.column.id,
            }),
            columnHelper.accessor('weight', {
                header: () => t('evaluation_criterias.table.weight', { ns: 'glossary' }),
                cell: (info) => info.getValue(),
                footer: (info) => info.column.id,
            }),
            columnHelper.accessor('id', {
                header: () => t('evaluation_criterias.table.score', { ns: 'glossary' }),
                cell: (info) => info.getValue(),
                footer: (info) => info.column.id,
            }),
        ],
        [t],
    );

    return (
        <div className="w-full h-full">
            <DataTable data={data} columns={columns} />
        </div>
    );
};
