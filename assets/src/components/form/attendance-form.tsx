import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PartialAttendance } from '@/types/attendance';
import { Form } from '@/components/ui/form';
import { DatePicker } from '@/components/picker/date-picker';
import { useTranslation } from 'react-i18next';
import { SelectField } from '@/components/field/select-field';
import { TextAreaField } from '@/components/field/textarea-field';

interface AttendanceFormProps {
    form: UseFormReturn<PartialAttendance>;
    isPending?: boolean;
}

export const AttendanceForm: React.FunctionComponent<AttendanceFormProps> = ({ form, isPending }) => {
    const { t } = useTranslation();

    return (
        <Form {...form}>
            <div className="flex flex-col space-y-4">
                <DatePicker
                    control={form.control}
                    name="attendanceDate"
                    label={t('attendance_date')}
                    disabled={isPending}
                />
                <SelectField
                    control={form.control}
                    name="status"
                    label={t('status')}
                    options={[
                        { value: 'present', label: t('attendance_statuses.present') },
                        { value: 'absent', label: t('attendance_statuses.absent') },
                        { value: 'leave', label: t('attendance_statuses.leave') },
                        { value: 'late', label: t('attendance_statuses.late') },
                    ]}
                    disabled={isPending}
                />
                <TextAreaField control={form.control} name="note" label={t('note')} disabled={isPending} />
            </div>
        </Form>
    );
};
