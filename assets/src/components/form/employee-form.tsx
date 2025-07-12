import React from 'react';
import { PartialEmployee } from '@/types/employee';
import { UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/field/text-field';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@/components/picker/date-picker';
import { Option } from '@/components/field/select-field';
import { useQuery } from '@tanstack/react-query';
import { fetchRoles } from '@/services/role';
import { MultipleSelectField } from '@/components/field/multiple-select-field';

interface EmployeeFormProps {
    form: UseFormReturn<PartialEmployee>;
    isPending?: boolean;
}

export const EmployeeForm: React.FunctionComponent<EmployeeFormProps> = ({ form, isPending }) => {
    const { t } = useTranslation();
    const { data = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: () => fetchRoles(),
    });

    const options = React.useMemo<Option[]>(
        () => data.map<Option>((item) => ({ label: item.name, value: item.id.toString() })),
        [data],
    );

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
                <MultipleSelectField
                    control={form.control}
                    name="roles"
                    label={t('roles')}
                    disabled={isPending}
                    options={options}
                />
            </div>
        </Form>
    );
};

EmployeeForm.displayName = 'EmployeeForm';
