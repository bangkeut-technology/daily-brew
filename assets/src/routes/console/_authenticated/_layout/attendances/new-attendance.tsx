import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/form/date-picker';
import { AttendanceStatusPicker } from '@/components/form/attendance-status-picker';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { EmployeeSelect } from '@/components/form/employee-select'; // You'll need to build or reuse this
import { AttendanceStatus } from '@/types/attendance';

export const NewAttendanceForm: React.FC = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState<Date>();
    const [employeeId, setEmployeeId] = useState<string>();
    const [status, setStatus] = useState<AttendanceStatus>();
    const [note, setNote] = useState<string>();

    const handleSubmit = async () => {
        if (!date || !employeeId || !status) {
            alert(t('form.error.required'));
            return;
        }

        const payload = {
            date: date.toISOString(),
            employeeId,
            status,
            note,
        };

        // 🔄 Send to backend
        console.log('Submitting attendance:', payload);
    };

    return (
        <form className="space-y-6 max-w-xl mx-auto">
            <EmployeeSelect value={employeeId} onChange={setEmployeeId} label={t('employee')} />

            <DatePicker label={t('attendance_date')} value={date} onChange={setDate} />

            <AttendanceStatusPicker label={t('status')} value={status} onChange={setStatus} />

            <div className="space-y-2">
                <label className="text-sm text-muted-foreground">{t('note')}</label>
                <Textarea placeholder={t('optional')} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <Button type="button" onClick={handleSubmit}>
                {t('save')}
            </Button>
        </form>
    );
};
