import React from 'react';
import { PartialEmployee } from '@/types/employee';
import { UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/field/text-field';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@/components/picker/date-picker';

interface EmployeeFormProps {
    form: UseFormReturn<PartialEmployee>;
    isPending?: boolean;
}

export const EmployeeForm: React.FunctionComponent<EmployeeFormProps> = ({ form, isPending }) => {
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
                <DatePicker control={form.control} name="dob" label={t('date_of_birth')} disabled={isPending} />
                <DatePicker control={form.control} name="joinedAt" label={t('joined_at')} disabled={isPending} />
            </div>
        </Form>
    );
};

EmployeeForm.displayName = 'EmployeeForm';
