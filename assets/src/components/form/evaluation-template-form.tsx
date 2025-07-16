import React from 'react';
import { PartialEvaluationTemplate } from '@/types/evaluation-template';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
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

export const EvaluationTemplateForm: React.FunctionComponent<EvaluationTemplateFormProps> = ({ form, isPending }) => {
    const { t } = useTranslation();
    const { fields } = useFieldArray({
        name: 'criterias',
        control: form.control,
    });

    return (
        <Form {...form}>
            <TextField control={form.control} name="name" label={t('evaluation_templates.name', { ns: 'glossary' })} />
            <TextAreaField
                control={form.control}
                name="description"
                label={t('evaluation_templates.description', { ns: 'glossary' })}
            />
            <EvaluationCriteriaSelect
                control={form.control}
                name="criterias"
                title={t('evaluation_criterias.title', { ns: 'glossary' })}
                description={t('evaluation_criterias.description', { ns: 'glossary' })}
            />
        </Form>
    );
};
