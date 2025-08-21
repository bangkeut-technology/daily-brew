import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchEvaluationTemplates } from '@/services/evaluation-template';

interface EvaluationTemplatePickerProps {
    className?: string;
    label?: string;
    nullable?: boolean;
    value?: string;
    onChange?: (value: string) => void;
}

export const EvaluationTemplatePicker: React.FunctionComponent<EvaluationTemplatePickerProps> = ({
    className,
    label,
    nullable,
    value,
    onChange,
}) => {
    const { t } = useTranslation();
    const { data = [] } = useQuery({
        queryKey: ['evaluation-templates'],
        queryFn: () => fetchEvaluationTemplates(),
    });

    const placeholder = React.useMemo(() => t('placeholder.picker.evaluation_template', { ns: 'glossary' }), [t]);

    return (
        <div className="flex flex-col space-y-2">
            {label && <Label>{label}</Label>}
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className={className}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {nullable && <SelectItem value="">{placeholder}</SelectItem>}
                    {data.map((e) => (
                        <SelectItem key={e.publicId} value={e.publicId}>
                            {e.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

EvaluationTemplatePicker.displayName = 'EmployeePicker';
