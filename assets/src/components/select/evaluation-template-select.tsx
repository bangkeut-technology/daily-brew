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
    placeholder?: string;
}

export const EvaluationTemplateSelect: React.FunctionComponent<EvaluationTemplateSelectProps> = ({
    control,
    name,
    label,
    description,
    placeholder,
}) => {
    const { data = [] } = useQuery({
        queryKey,
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
        <div className="flex flex-row space-x-2 items-center">
            <SelectField
                control={control}
                name={name}
                options={options}
                label={label}
                description={description}
                placeholder={placeholder}
            />
            <NewEvaluationTemplateDialog queryKey={queryKey} />
        </div>
    );
};

EvaluationTemplateSelect.displayName = 'EvaluationTemplateSelect';
