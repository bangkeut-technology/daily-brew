import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { CircleX, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/loader/loading';
import i18next from '@/i18next';
import { fetchAttendanceBatch, putAttendanceBatch } from '@/services/attendance-batch';
import { PartialAttendanceBatch } from '@/types/attendance-batch';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { attendanceBatchSchema } from '@/schema/attendance-batch-schema';
import { AttendanceBatchNotFound } from '@/routes/console/_authenticated/_layout/attendance-batches/$publicId/-components/attendance-batch-not-found';
import { useMutation } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { AttendanceTypeBadge } from '@/components/attendance/attendance-type-badge';
import { format } from 'date-fns';
import { DISPLAY_DATE_FORMAT } from '@/constants/date';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { AttendanceBatchForm } from '@/components/form/attendance-batch-form';

export const Route = createFileRoute('/console/_authenticated/_layout/attendance-batches/$publicId/edit')({
    component: EditAttendanceBatchPage,
    loader: ({ params: { publicId } }) => fetchAttendanceBatch(publicId),
    errorComponent: () => <AttendanceBatchNotFound />,
    pendingComponent: () => <Loading loadingText={i18next.t('attendance_batches.loading', { ns: 'glossary' })} />,
});

function EditAttendanceBatchPage() {
    const { t } = useTranslation();
    const batch = Route.useLoaderData();
    const navigate = Route.useNavigate();
    const form = useForm<PartialAttendanceBatch>({
        resolver: yupResolver(attendanceBatchSchema),
        defaultValues: {
            label: batch.label,
            note: batch.note,
            type: batch.type,
            fromDate: new Date(batch.fromDate),
            toDate: new Date(batch.toDate),
            employees: batch.employees?.map((employee) => ({ value: employee.id })) || [],
        },
    });
    const { mutate, isPending } = useMutation({
        mutationFn: putAttendanceBatch,
        onSuccess: (data) => {
            toast.success(data.message);
            navigate({ to: '/console/attendance-batches/$publicId', params: { publicId: batch.publicId } });
        },
        onError: (error) => {
            const errorMessage = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(errorMessage);
        },
    });

    const onSubmit = React.useCallback(
        (data: PartialAttendanceBatch) => {
            mutate({ publicId: batch.publicId, data });
        },
        [batch.publicId, mutate],
    );

    return (
        <div className="space-y-6">
            {/* Sticky header */}
            <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto w-full max-w-screen-2xl px-4 py-3">
                    <div className="grid gap-3 md:grid-cols-[1fr,auto] md:items-center">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-xl sm:text-2xl font-semibold">
                                        {t('attendance_batches.edit.title', { ns: 'glossary' })}
                                    </h1>
                                    <Badge variant="secondary" className="ml-1">
                                        {t('label')}: {batch.label}
                                    </Badge>
                                </div>
                                <AttendanceTypeBadge type={batch.type} />
                            </div>
                            <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                                <span>
                                    {t('created_at')}:{' '}
                                    {batch.createdAt ? format(batch.createdAt, DISPLAY_DATE_FORMAT) : '—'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap md:justify-end gap-2">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() =>
                                    navigate({
                                        to: '/console/attendance-batches/$publicId',
                                        params: { publicId: batch.publicId },
                                    })
                                }
                                disabled={isPending}
                            >
                                <CircleX className="h-4 w-4" />
                                {t('cancel')}
                            </Button>
                            <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                                <Save className="mr-2 h-4 w-4" />
                                {isPending ? t('saving') : t('save')}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mx-auto w-full max-w-screen-md px-4">
                <div className="rounded-lg border p-4 sm:p-6 space-y-6">
                    <AttendanceBatchForm form={form} defaultEmployees={batch.employees} isPending={isPending} />
                </div>
            </div>
        </div>
    );
}
