import React from 'react';
import { DatePicker } from '@/components/picker/date-picker';
import { useTranslation } from 'react-i18next';
import { EmployeePicker } from '@/components/picker/employee-picker';
import { AttendanceStatusPicker } from '@/components/picker/attendance-status-picker';
import { AttendanceStatus } from '@/types/attendance';
import { AttendanceSearchParams } from '@/services/attendance';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@/constants/date';

interface AttendanceSearchFormProps {
    from: string | undefined;
    to: string | undefined;
    employee: string | undefined;
    status: AttendanceStatus | undefined;
    onChange: (patch: Partial<AttendanceSearchParams>) => void;
}

export const AttendanceSearchForm: React.FC<AttendanceSearchFormProps> = ({ from, to, employee, status, onChange }) => {
    const { t } = useTranslation();

    return (
        <React.Fragment>
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
            <EmployeePicker
                label={t('employee')}
                nullable
                value={employee}
                onChange={(employee) => onChange({ employee })}
            />
            <AttendanceStatusPicker
                label={t('attendance_status')}
                value={status}
                onChange={(status) => onChange({ status })}
            />
        </React.Fragment>
    );
};

AttendanceSearchForm.displayName = 'SearchForm';
