import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/picker/date-picker';
import { useTranslation } from 'react-i18next';
import { EmployeePicker } from '@/components/picker/employee-picker';
import { AttendanceStatusPicker } from '@/components/picker/attendance-status-picker';
import { AttendanceStatus } from '@/types/attendance';
import { AttendanceSearchParams } from '@/services/attendance';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@/constants/date';

interface SearchFormProps {
    from: string | undefined;
    to: string | undefined;
    employee: string | undefined;
    status: AttendanceStatus | undefined;
    onChange: (patch: Partial<AttendanceSearchParams>) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ from, to, employee, status, onChange }) => {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Filters</CardTitle>
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
                <EmployeePicker nullable value={employee} onChange={(employee) => onChange({ employee })} />
                <AttendanceStatusPicker value={status} onChange={(status) => onChange({ status })} />
            </CardContent>
        </Card>
    );
};
