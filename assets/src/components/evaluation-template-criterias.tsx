import React from 'react';
import { EvaluationTemplate } from '@/types/evaluation-template';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchTemplateCriterias } from '@/services/evaluation-template';
import { SelectField } from '@/components/field/select-field';
import { Separator } from '@/components/ui/separator';
import { useFieldArray, useForm } from 'react-hook-form';
import { Loader2Icon } from 'lucide-react';
import { Form } from '@/components/ui/form';

interface EvaluationTemplateCriteriasProps {
    template: EvaluationTemplate;
}

type Score = {
    label: string;
    id: number;
    score: string;
};

export const EvaluationTemplateCriterias: React.FunctionComponent<EvaluationTemplateCriteriasProps> = ({
    template,
}) => {
    const { t } = useTranslation();
    const {
        data = [],
        isPending,
        isSuccess,
    } = useQuery({
        queryKey: ['evaluation-template-criterias', template.identifier],
        queryFn: async () => fetchTemplateCriterias(template.identifier),
    });
    const form = useForm<{
        criterias: Array<Score>;
    }>({
        defaultValues: {
            criterias: [],
        },
    });
    const { fields } = useFieldArray({ control: form.control, name: 'criterias' });

    React.useEffect(() => {
        if (isSuccess && data.length) {
            const criterias = data.map<Score>((criteria) => ({
                label: criteria.criteria.label,
                id: criteria.id,
                score: '1',
            }));
            form.reset({ criterias });
        }
    }, [data, form, isSuccess]);

    const options = React.useMemo(
        () =>
            Array.from({ length: 5 }, (_, i) => {
                const value = String(i + 1);
                return { label: value, value };
            }),
        [],
    );

    const label = React.useMemo(() => t('evaluation_template_criterias.score', { ns: 'glossary' }), [t]);

    const renderItems = React.useCallback(() => {
        if (isPending) {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <Loader2Icon className="animate-spin h-6 w-6 text-gray-500" />
                </div>
            );
        }
        return fields.map((item, index) => (
            <div key={item.id}>
                <div className="grid grid-cols-4 gap-4 items-center p-4">
                    <p className="text-2xl col-span-2 font-semibold">{item.label}</p>
                    <Separator orientation="vertical" />
                    <SelectField
                        className="w-full"
                        control={form.control}
                        name={`criterias.${index}.score`}
                        options={options}
                        label={label}
                    />
                </div>
                <Separator orientation="horizontal" />
            </div>
        ));
    }, [fields, form.control, isPending, label, options]);

    return (
        <div className="w-full h-full">
            <Form {...form}>{renderItems()}</Form>
        </div>
    );
};
