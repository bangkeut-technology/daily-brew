import React from 'react';
import { PartialEvaluationTemplate } from '@/types/evaluation-template';
import { UseFormReturn } from 'react-hook-form';
import { TextField } from '@/components/field/text-field';
import { TextAreaField } from '@/components/field/textarea-field';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/form';
import { EvaluationCriteriaSelect } from '@/components/select/evaluation-criteria-select';
import { EmployeesSelect } from '@/components/select/employees-select';

interface EvaluationTemplateFormProps {
    form: UseFormReturn<PartialEvaluationTemplate>;
    isPending?: boolean;
    withCriterias?: boolean;
    withEmployees?: boolean;
}

export const EvaluationTemplateForm = React.memo<EvaluationTemplateFormProps>(
    ({ form, isPending, withCriterias, withEmployees }) => {
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
                {withCriterias && (
                    <EvaluationCriteriaSelect
                        control={form.control}
                        name="criterias"
                        title={t('evaluation_criterias.table.title', { ns: 'glossary' })}
                        description={t('evaluation_criterias.table.description', { ns: 'glossary' })}
                    />
                )}
                {withEmployees && (
                    <EmployeesSelect
                        control={form.control}
                        name="employees"
                        title={t('employees.table.title', { ns: 'glossary' })}
                        description={t('employees.table.description', { ns: 'glossary' })}
                    />
                )}
            </Form>
        );
    },
);

EvaluationTemplateForm.displayName = 'EvaluationTemplateForm';
