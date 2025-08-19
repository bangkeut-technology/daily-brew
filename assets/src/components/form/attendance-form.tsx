import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AttendanceStatusEnum, PartialAttendance } from '@/types/attendance';
import { Form } from '@/components/ui/form';
import { DatePickerControl } from '@/components/picker/date-picker-control';
import { useTranslation } from 'react-i18next';
import { SelectField } from '@/components/field/select-field';
import { TextAreaField } from '@/components/field/textarea-field';

interface AttendanceFormProps {
    form: UseFormReturn<PartialAttendance>;
    isPending?: boolean;
}

export const AttendanceForm: React.FunctionComponent<AttendanceFormProps> = ({ form, isPending }) => {
    const { t } = useTranslation();

    const options = React.useMemo(() => {
        return Object.entries(AttendanceStatusEnum).map(([_, value]) => ({
            value,
            label: t(`attendance_statuses.${value}`),
        }));
    }, [t]);

    return (
        <Form {...form}>
            <div className="flex flex-col space-y-4">
                <DatePickerControl
                    control={form.control}
                    name="attendanceDate"
                    label={t('attendance_date')}
                    disabled={isPending}
                />
                <SelectField
                    className="w-full"
                    control={form.control}
                    name="status"
                    label={t('status')}
                    options={options}
                    disabled={isPending}
                />
                <TextAreaField control={form.control} name="note" label={t('note')} disabled={isPending} />
            </div>
        </Form>
    );
};
