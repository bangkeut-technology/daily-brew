import React from 'react';
import { PartialEvaluationTemplate } from '@/types/evaluation-template';
import { UseFormReturn } from 'react-hook-form';
import { TextField } from '@/components/field/text-field';
import { TextAreaField } from '@/components/field/textarea-field';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/form';
import { EvaluationCriteriaSelect } from '@/components/select/evaluation-criteria-select';

interface EvaluationTemplateFormProps {
    form: UseFormReturn<PartialEvaluationTemplate>;
    isPending?: boolean;
    onSubmit?: (data: PartialEvaluationTemplate) => void;
}

export const EvaluationTemplateForm = React.memo<EvaluationTemplateFormProps>(({ form, isPending }) => {
    const { t } = useTranslation();

    return (
        <Form {...form}>
            <TextField
                control={form.control}
                name="name"
                label={t('evaluation_templates.name', { ns: 'glossary' })}
                disabled={isPending}
            />
            <TextAreaField
                control={form.control}
                name="description"
                label={t('evaluation_templates.description', { ns: 'glossary' })}
                disabled={isPending}
            />
            <EvaluationCriteriaSelect
                control={form.control}
                name="criterias"
                title={t('evaluation_criterias.table.title', { ns: 'glossary' })}
                description={t('evaluation_criterias.table.description', { ns: 'glossary' })}
            />
        </Form>
    );
});

EvaluationTemplateForm.displayName = 'EvaluationTemplateForm';
