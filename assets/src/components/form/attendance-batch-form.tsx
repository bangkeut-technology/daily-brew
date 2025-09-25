import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { DatePickerControl } from '@/components/picker/date-picker-control';
import { useTranslation } from 'react-i18next';
import { TextAreaField } from '@/components/field/textarea-field';
import { PartialAttendanceBatch } from '@/types/attendance-batch';
import { TextField } from '@/components/field/text-field';
import { AttendanceTypeSelect } from '@/components/select/attendance-type-select';

interface AttendanceBatchFormProps {
    form: UseFormReturn<PartialAttendanceBatch>;
    isPending?: boolean;
}

export const AttendanceBatchForm: React.FunctionComponent<AttendanceBatchFormProps> = ({ form, isPending }) => {
    const { t } = useTranslation();

    return (
        <Form {...form}>
            <div className="flex flex-col space-y-4">
                <TextField
                    control={form.control}
                    name="label"
                    label={t('label')}
                    placeholder="Sophia"
                    disabled={isPending}
                />
                <AttendanceTypeSelect
                    className="w-full"
                    control={form.control}
                    name="type"
                    label={t('type')}
                    disabled={isPending}
                />
                <DatePickerControl control={form.control} name="fromDate" label={t('from')} disabled={isPending} />
                <DatePickerControl control={form.control} name="toDate" label={t('to')} disabled={isPending} />
                <TextAreaField control={form.control} name="note" label={t('note')} disabled={isPending} />
            </div>
        </Form>
    );
};

AttendanceBatchForm.displayName = 'AttendanceForm';
