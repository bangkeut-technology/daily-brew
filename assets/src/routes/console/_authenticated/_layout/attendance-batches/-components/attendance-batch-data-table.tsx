import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';
import { RowSelectionState } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/table-core';
import { AttendanceBatch, AttendanceBatchSearchParams } from '@/types/attendance-batch';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { DISPLAY_DATE_FORMAT, DISPLAY_TIME_FORMAT } from '@/constants/date';
import { AttendanceTypeBadge } from '@/components/attendance/attendance-type-badge';
import { fetchAttendanceBatches } from '@/services/attendance-batch';
import { Button } from '@/components/ui/button';
import { Eye, Pencil } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const columnHelper = createColumnHelper<AttendanceBatch>();

interface AttendanceBatchDataTableProps {
    params: AttendanceBatchSearchParams;
    onView?: (batch: AttendanceBatch) => void;
    onEdit?: (batch: AttendanceBatch) => void;
}

export const AttendanceBatchDataTable: React.FunctionComponent<AttendanceBatchDataTableProps> = ({
    params,
    onView,
    onEdit,
}) => {
    const { t } = useTranslation();
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const { data = [], isPending } = useQuery({
        queryKey: ['attendance-batches', params],
        queryFn: () => fetchAttendanceBatches(params),
    });

    const columns = React.useMemo(() => {
        return [
            columnHelper.accessor('label', {
                header: t('label'),
                cell: ({ getValue }) => getValue(),
            }),
            columnHelper.accessor('type', {
                header: t('type'),
                cell: ({ getValue }) => <AttendanceTypeBadge type={getValue()} />,
            }),
            columnHelper.accessor('fromDate', {
                header: t('from'),
                cell: ({ getValue }) => format(getValue(), DISPLAY_DATE_FORMAT),
            }),
            columnHelper.accessor('toDate', {
                header: t('to'),
                // If you actually want date here, switch to DISPLAY_DATE_FORMAT
                cell: ({ getValue }) => {
                    const time = getValue();
                    if (time) {
                        return format(time, DISPLAY_TIME_FORMAT);
                    }
                    return '-';
                },
            }),
            columnHelper.accessor((row) => row.user?.fullName, {
                id: 'user.fullName',
                header: t('recorded_by'),
                cell: ({ getValue }) => getValue(),
            }),
            columnHelper.display({
                id: 'actions',
                header: t('actions'),
                cell: ({ row }) => {
                    const batch = row.original;
                    const viewHref = {
                        to: '/console/attendance-batches/$publicId',
                        params: { publicId: batch.publicId },
                    } as const;
                    const editHref = {
                        to: '/console/attendance-batches/$publicId/edit',
                        params: { publicId: batch.publicId },
                    } as const;

                    return (
                        <div className="flex items-center gap-2">
                            {onView ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={t('view') ?? 'View'}
                                    onClick={() => onView(batch)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button asChild variant="ghost" size="icon" aria-label={t('view') ?? 'View'}>
                                    <Link {...viewHref}>
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                            )}

                            {onEdit ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={t('edit') ?? 'Edit'}
                                    onClick={() => onEdit(batch)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button asChild variant="ghost" size="icon" aria-label={t('edit') ?? 'Edit'}>
                                    <Link {...editHref}>
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    );
                },
            }),
        ];
    }, [t, onView, onEdit]);

    return (
        <DataTable
            data={data}
            columns={columns}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            loading={isPending}
        />
    );
};

AttendanceBatchDataTable.displayName = 'AttendanceBatchDataTable';
