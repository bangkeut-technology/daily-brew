import * as React from 'react';
import { CalendarRange, CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const AttendanceBatchNotFound: React.FunctionComponent = () => {
    const { t } = useTranslation();

    return (
        <div className="w-full h-full flex justify-center items-center">
            <CalendarX className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">{t('attendance_batches.not_found.title', { ns: 'glossary' })}</p>
            <span className="text-sm text-muted-foreground">
                {t('attendance_batches.not_found.description', { ns: 'glossary' })}
            </span>
            <Button asChild>
                <Link to="/console/attendance-batches">
                    <CalendarRange className="w-4 h-4" />
                    {t('attendance_batches.not_found.button', { ns: 'glossary' })}
                </Link>
            </Button>
        </div>
    );
};
