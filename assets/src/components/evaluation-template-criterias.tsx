import React from 'react';
import { EvaluationTemplate } from '@/types/evaluation-template';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchTemplateCriterias } from '@/services/evaluation-template';
import { SelectField } from '@/components/field/select-field';
import { Separator } from '@/components/ui/separator';
import { useFieldArray, useForm } from 'react-hook-form';
import { Loader2Icon } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { postEmployeeEvaluation } from '@/services/employee-evaluation';
import { PartialEmployeeEvaluation } from '@/types/employee-evaluation';
import { PartialEmployeeScore } from '@/types/EmployeeScore';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Employee } from '@/types/employee';

interface EvaluationTemplateCriteriasProps {
    employee: Employee;
    template: EvaluationTemplate;
}

export const EvaluationTemplateCriterias: React.FunctionComponent<EvaluationTemplateCriteriasProps> = ({
    employee,
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
    const { mutate } = useMutation({
        mutationFn: postEmployeeEvaluation,
        onSuccess: (data) => {
            toast.success(data.message);
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });
    const form = useForm<PartialEmployeeEvaluation>({
        defaultValues: {
            template: template.id,
            note: '',
            scores: [],
        },
    });
    const { fields } = useFieldArray({ control: form.control, name: 'scores' });

    React.useEffect(() => {
        if (isSuccess && data.length) {
            const scores = data.map<PartialEmployeeScore>((criteria) => ({
                criteriaLabel: criteria.criteria.label,
                criteria: criteria.id,
                weight: criteria.weight,
                score: '1',
            }));
            form.setValue('scores', scores);
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
                    <p className="text-2xl col-span-2 font-semibold">{item.criteriaLabel}</p>
                    <Separator orientation="vertical" />
                    <SelectField
                        className="w-full"
                        control={form.control}
                        name={`scores.${index}.score`}
                        options={options}
                        label={label}
                    />
                </div>
                <Separator orientation="horizontal" />
            </div>
        ));
    }, [fields, form.control, isPending, label, options]);

    const onSubmit = React.useCallback(
        (data: PartialEmployeeEvaluation) => {
            mutate({ identifier: employee.identifier, data });
        },
        [employee.identifier, mutate],
    );

    return (
        <div className="w-full h-full">
            <Form {...form}>{renderItems()}</Form>
            <Button onClick={form.handleSubmit(onSubmit)} className="w-full mt-4">
                {t('employee_evaluations.new.save', { ns: 'glossary' })}
            </Button>
        </div>
    );
};
