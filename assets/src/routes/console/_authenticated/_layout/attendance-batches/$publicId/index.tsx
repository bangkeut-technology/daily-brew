import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchAttendanceBatch } from '@/services/attendance-batch';
import { CalendarDays, CalendarRange, Clock, Loader2, Pencil, Tag, UserRound, UserRoundX } from 'lucide-react';
import { AttendanceTypeBadge } from '@/components/attendance/attendance-type-badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DISPLAY_DATE_FORMAT, DISPLAY_TIME_FORMAT } from '@/constants/date';
import { format } from 'date-fns';
import { DeleteAttendanceBatchButon } from '@/components/button/delete-attendance-batch-button';
import { EmployeeDataTable } from '@/components/data-table/employee-data-table';

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
            <div className="w-full h-full space-y-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{t('summary')}</CardTitle>
                        <CardDescription>
                            {t('attendance_batches.detail.description', { ns: 'glossary' })}
                        </CardDescription>
                        <CardAction className="space-x-2">
                            <Button asChild>
                                <Link to="/console/attendance-batches/$publicId/edit" params={{ publicId }}>
                                    <Pencil className="h-4 w-4" />
                                    {t('edit')}
                                </Link>
                            </Button>
                            <DeleteAttendanceBatchButon attendanceBatchPublicId={publicId} withText />
                        </CardAction>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3 rounded-md border p-3">
                            <div className="flex min-w-0 items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium truncate">{batch.label || '-'}</span>
                            </div>
                            <div className="h-4 w-px bg-border" />
                            <div className="flex items-center gap-2">
                                <AttendanceTypeBadge type={batch.type} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            <InfoRow
                                icon={<CalendarRange className="h-4 w-4" />}
                                label={t('from')}
                                value={batch.fromDate ? format(batch.fromDate, DISPLAY_DATE_FORMAT) : '-'}
                            />
                            <InfoRow
                                icon={<CalendarDays className="h-4 w-4" />}
                                label={t('to')}
                                value={batch.toDate ? format(batch.toDate, DISPLAY_DATE_FORMAT) : '-'}
                            />
                            <InfoRow
                                icon={<UserRound className="h-4 w-4" />}
                                label={t('recorded_by')}
                                value={batch.user?.fullName || '-'}
                            />
                            <InfoRow
                                icon={<Clock className="h-4 w-4" />}
                                label={t('created_at')}
                                value={
                                    batch.createdAt
                                        ? `${format(batch.createdAt, DISPLAY_DATE_FORMAT)} · ${format(
                                              batch.createdAt,
                                              DISPLAY_TIME_FORMAT,
                                          )}`
                                        : '-'
                                }
                            />
                            <InfoRow
                                icon={<Clock className="h-4 w-4" />}
                                label={t('created_at')}
                                value={
                                    batch.updatedAt
                                        ? `${format(batch.updatedAt, DISPLAY_DATE_FORMAT)} · ${format(
                                              batch.createdAt,
                                              DISPLAY_TIME_FORMAT,
                                          )}`
                                        : '-'
                                }
                            />

                            {batch.note && (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                                    <div className="rounded-md border p-3">
                                        <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Tag className="h-4 w-4" />
                                            <span>{t('note')}</span>
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{batch.note}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('attendance_batches.employees.title', { ns: 'glossary' })}</CardTitle>
                        <CardDescription>
                            {t('attendance_batches.employees.description', { ns: 'glossary' })}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <EmployeeDataTable employees={batch.employees || []} />
                    </CardContent>
                </Card>
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

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: React.ReactNode; value: React.ReactNode }) {
    return (
        <div className="rounded-md border p-3">
            <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-muted-foreground/70">{icon}</span>
                <span className="truncate">{label}</span>
            </div>
            <div className="font-medium">{value}</div>
        </div>
    );
}
