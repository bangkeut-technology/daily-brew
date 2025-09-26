import React from 'react';
import { DatePicker } from '@/components/picker/date-picker';
import { useTranslation } from 'react-i18next';
import { AttendanceTypePicker } from '@/components/picker/attendance-type-picker';
import { AttendanceSearchParams, AttendanceType } from '@/types/attendance';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@/constants/date';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttendanceBatchSearchFormProps {
    from: string | undefined;
    to: string | undefined;
    name: string | undefined;
    type: AttendanceType | undefined;
    onChange: (patch: Partial<AttendanceSearchParams>) => void;
}

export const AttendanceBatchSearchForm: React.FC<AttendanceBatchSearchFormProps> = ({ from, to, type, onChange }) => {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">{t('filters')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-5">
                <DatePicker
                    label={t('from')}
                    value={from ? new Date(from) : undefined}
                    nullable
                    onChange={(from) => onChange({ from: from ? format(from, DATE_FORMAT) : undefined })}
                />
                <DatePicker
                    label={t('to')}
                    value={to ? new Date(to) : undefined}
                    nullable
                    onChange={(to) => onChange({ to: to ? format(to, DATE_FORMAT) : undefined })}
                />
                <AttendanceTypePicker
                    label={t('attendance_type')}
                    value={type}
                    onChange={(type) => onChange({ type })}
                />
            </CardContent>
        </Card>
    );
};

AttendanceBatchSearchForm.displayName = 'AttendanceBatchSearchForm';
