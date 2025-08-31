import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
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
            <Button type="button" onClick={handleSubmit}>
                {t('save')}
            </Button>
        </form>
    );
};
