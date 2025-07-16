import React from 'react';
import { Control } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { fetchEvaluationTemplates } from '@/services/evaluation-template';
import { Option, SelectField } from '@/components/field/select-field';
import { NewEvaluationTemplateDialog } from '@/components/dialog/new-evaluation-template-dialog';

const queryKey = ['daily-brew-evaluation-templates'];

interface EvaluationTemplateSelectProps {
    control: Control<any>;
    name: string;
    label?: string;
    description?: string;
}

export const EvaluationTemplateSelect: React.FunctionComponent<EvaluationTemplateSelectProps> = ({
    control,
    name,
    label,
    description,
}) => {
    const { data = [] } = useQuery({
        queryKey: ['evaluation-templates'],
        queryFn: () => fetchEvaluationTemplates(),
    });

    const options = React.useMemo<Option[]>(
        () =>
            data.map((template) => ({
                label: template.name,
                value: template.id.toString(),
            })),
        [data],
    );

    return (
        <div className="flex flex-row space-x-2">
            <SelectField control={control} name={name} options={options} label={label} description={description} />
            <NewEvaluationTemplateDialog queryKey={queryKey} />
        </div>
    );
};
