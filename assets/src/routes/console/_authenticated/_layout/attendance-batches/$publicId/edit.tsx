import React from 'react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { CalendarRange, CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AttendanceBatchNotFound } from '@/routes/console/_authenticated/_layout/attendance-batches/$publicId/-components/attendance-batch-not-found';
import { Loading } from '@/components/loader/loading';
import i18next from '@/i18next';
import { fetchAttendanceBatch } from '@/services/attendance-batch';

export const Route = createFileRoute('/console/_authenticated/_layout/attendance-batches/$publicId/edit')({
    component: EditAttendanceBatchPage,
    loader: ({ params: { publicId } }) => fetchAttendanceBatch(publicId),
    notFoundComponent: () => <AttendanceBatchNotFound />,
    pendingComponent: () => <Loading loadingText={i18next.t('attendance_batches.loading', { ns: 'glossary' })} />,
});

function EditAttendanceBatchPage() {
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
}
