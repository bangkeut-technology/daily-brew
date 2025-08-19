import React from 'react';
import { PartialEmployee } from '@/types/employee';
import { UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/field/text-field';
import { useTranslation } from 'react-i18next';
import { DatePickerControl } from '@/components/picker/date-picker-control';
import { RoleSelect } from '@/components/select/role-select';
import { EvaluationTemplateSelect } from '@/components/select/evaluation-template-select';

interface EmployeeFormProps {
    form: UseFormReturn<PartialEmployee>;
    isPending?: boolean;
    withTemplates?: boolean;
}

export const EmployeeForm: React.FunctionComponent<EmployeeFormProps> = ({ form, isPending, withTemplates }) => {
    const { t } = useTranslation();

    return (
        <Form {...form}>
            <div className="flex flex-col space-y-4">
                <TextField control={form.control} name="firstName" label={t('first_name')} disabled={isPending} />
                <TextField control={form.control} name="lastName" label={t('last_name')} disabled={isPending} />
                <TextField
                    control={form.control}
                    name="phoneNumber"
                    label={t('phone_number')}
                    type="tel"
                    disabled={isPending}
                />
                <DatePickerControl control={form.control} name="dob" label={t('date_of_birth')} disabled={isPending} />
                <DatePickerControl control={form.control} name="joinedAt" label={t('joined_at')} disabled={isPending} />
                {withTemplates && (
                    <EvaluationTemplateSelect
                        name="template"
                        control={form.control}
                        label={t('evaluation_templates.title', { ns: 'glossary' })}
                        description={t('evaluation_templates.select.description', { ns: 'glossary' })}
                        placeholder={t('evaluation_templates.select.placeholder', { ns: 'glossary' })}
                    />
                )}
                <RoleSelect
                    control={form.control}
                    name="roles"
                    title={t('employees.roles.title', { ns: 'glossary' })}
                    description={t('employees.roles.description', { ns: 'glossary' })}
                />
            </div>
        </Form>
    );
};

EmployeeForm.displayName = 'EmployeeForm';
