import React from 'react';
import { PartialEvaluationCriteria } from '@/types/evaluation-criteria';
import { UseFormReturn } from 'react-hook-form';
import { TextField } from '@/components/field/text-field';
import { TextAreaField } from '@/components/field/textarea-field';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/form';

interface EvaluationCriteriaFormProps {
    form: UseFormReturn<PartialEvaluationCriteria>;
    isPending?: boolean;
    onSubmit?: (data: PartialEvaluationCriteria) => void;
}

export const EvaluationCriteriaForm: React.FunctionComponent<EvaluationCriteriaFormProps> = ({ form, isPending }) => {
    const { t } = useTranslation();

    return (
        <Form {...form}>
            <TextField
                control={form.control}
                name="name"
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
        </Form>
    );
};

EvaluationCriteriaForm.displayName = 'EvaluationCriteriaForm';
