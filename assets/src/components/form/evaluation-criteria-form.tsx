import React from 'react';
import { PartialEvaluationCriteria } from '@/types/evaluation-criteria';
import { UseFormReturn } from 'react-hook-form';
import { TextField } from '@/components/field/text-field';
import { TextAreaField } from '@/components/field/textarea-field';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/form';
import { SelectField } from '@/components/field/select-field';
import { EvaluationTemplateMultiSelect } from '@/components/select/evaluation-template-multi-select';

interface EvaluationCriteriaFormProps {
    form: UseFormReturn<PartialEvaluationCriteria>;
    isPending?: boolean;
    withTemplates?: boolean;
}

export const EvaluationCriteriaForm = React.memo<EvaluationCriteriaFormProps>(({ form, isPending, withTemplates }) => {
    const { t } = useTranslation();

    const options = React.useMemo(
        () =>
            Array.from({ length: 5 }, (_, i) => {
                const value = String(i + 1);
                return { label: value, value };
            }),
        [],
    );

    return (
        <Form {...form}>
            <TextField
                control={form.control}
                name="label"
                label={t('evaluation_criterias.label.title', { ns: 'glossary' })}
                description={t('evaluation_criterias.label.description', { ns: 'glossary' })}
                disabled={isPending}
            />
            <TextAreaField
                control={form.control}
                name="description"
                label={t('evaluation_criterias.description.title', { ns: 'glossary' })}
                description={t('evaluation_criterias.description.description', { ns: 'glossary' })}
                disabled={isPending}
            />
            <SelectField
                control={form.control}
                name="weight"
                options={options}
                label={t('evaluation_criterias.weight.title', { ns: 'glossary' })}
                description={t('evaluation_criterias.weight.description', { ns: 'glossary' })}
            />
            {withTemplates && (
                <EvaluationTemplateMultiSelect
                    control={form.control}
                    name="templates"
                    description={t('evaluation_criterias.templates.description', { ns: 'glossary' })}
                    title={t('evaluation_criterias.templates.title', { ns: 'glossary' })}
                />
            )}
        </Form>
    );
});

EvaluationCriteriaForm.displayName = 'EvaluationCriteriaForm';
