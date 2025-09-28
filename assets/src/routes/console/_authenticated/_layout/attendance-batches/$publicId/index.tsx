import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchAttendanceBatch } from '@/services/attendance-batch';
import { Loader2, Pencil, UserRoundX } from 'lucide-react';
import { AttendanceTypeBadge } from '@/components/attendance/attendance-type-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DISPLAY_DATE_FORMAT, DISPLAY_TIME_FORMAT } from '@/constants/date';
import { format } from 'date-fns';
import { DeleteAttendanceBatchButon } from '@/components/button/delete-attendance-batch-button';

export const Route = createFileRoute('/console/_authenticated/_layout/attendance-batches/$publicId/')({
    component: AttendanceBatchPage,
});

function AttendanceBatchPage() {
    const { publicId } = Route.useParams();
    const { t } = useTranslation();
    const { data: batch, isPending } = useQuery({
        queryKey: ['attendance-batch', publicId],
        queryFn: () => fetchAttendanceBatch(publicId),
    });

    if (isPending) {
        return (
            <div className="w-full h-full flex flex-col justify-center items-center">
                <Loader2 className="animate-spin w-16 h-16 mb-4" />
                <h4>{t('employees.loading', { ns: 'glossary' })}</h4>
            </div>
        );
    }

    if (batch) {
        return (
            <div className="flex flex-col space-y-6">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold">
                            {batch.label ?? t('attendance_batches.detail.title', { ns: 'glossary' })}
                        </h2>
                        <AttendanceTypeBadge type={batch.type} />
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {t('attendance_batches.detail.description', { ns: 'glossary' })}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button asChild>
                            <Link to="/console/attendance-batches/$publicId/edit" params={{ publicId }}>
                                <Pencil className="h-4 w-4 mr-2" />
                                {t('edit')}
                            </Link>
                        </Button>
                        <DeleteAttendanceBatchButon attendanceBatchPublicId={publicId} withText />

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('summary')}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <SummaryItem label={t('label')} value={batch.label || '-'} />
                                <SummaryItem label={t('type')} value={<AttendanceTypeBadge type={batch.type} />} />
                                <SummaryItem
                                    label={t('from')}
                                    value={batch.fromDate ? format(batch.fromDate, DISPLAY_DATE_FORMAT) : '-'}
                                />
                                <SummaryItem
                                    label={t('to')}
                                    value={batch.toDate ? format(batch.toDate, DISPLAY_DATE_FORMAT) : '-'}
                                />
                                <SummaryItem label={t('recorded_by')} value={batch.user?.fullName || '-'} />
                                <SummaryItem
                                    label={t('created_at')}
                                    value={
                                        batch.createdAt
                                            ? `${format(batch.createdAt, DISPLAY_DATE_FORMAT)} · ${format(batch.createdAt, DISPLAY_TIME_FORMAT)}`
                                            : '-'
                                    }
                                />

                                {batch.note && (
                                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                        <div className="text-sm text-muted-foreground mb-1">{t('note')}</div>
                                        <p className="whitespace-pre-wrap">{batch.note}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex justify-center items-center">
            <UserRoundX className="w-16 h-16 mb-4" />
            <p className="text-lg text-muted-foreground">{t('employees.not_found', { ns: 'glossary' })}</p>
        </div>
    );
}

function SummaryItem({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
    return (
        <div className="p-3 rounded-md border">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-1">{value}</div>
        </div>
    );
}
