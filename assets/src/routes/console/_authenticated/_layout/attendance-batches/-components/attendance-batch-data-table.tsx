import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/data-table';
import { RowSelectionState } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/table-core';
import { AttendanceBatch, AttendanceBatchSearchParams } from '@/types/attendance-batch';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { DISPLAY_DATE_FORMAT } from '@/constants/date';
import { AttendanceTypeBadge } from '@/components/attendance/attendance-type-badge';
import { fetchAttendanceBatches } from '@/services/attendance-batch';
import { Button } from '@/components/ui/button';
import { Eye, Pencil } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { DeleteAttendanceBatchButon } from '@/components/button/delete-attendance-batch-button';

const columnHelper = createColumnHelper<AttendanceBatch>();

interface AttendanceBatchDataTableProps {
    params: AttendanceBatchSearchParams;
}

export const AttendanceBatchDataTable: React.FunctionComponent<AttendanceBatchDataTableProps> = ({ params }) => {
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
                cell: ({ getValue }) => {
                    const time = getValue();
                    if (time) {
                        return format(time, DISPLAY_DATE_FORMAT);
                    }
                    return '-';
                },
            }),
            columnHelper.accessor((row) => row.user?.fullName, {
                id: 'user.fullName',
                header: t('recorded_by'),
                cell: ({ getValue }) => getValue(),
            }),
            columnHelper.accessor('publicId', {
                id: 'actions',
                header: t('actions'),
                cell: ({ getValue }) => {
                    const viewHref = {
                        to: '/console/attendance-batches/$publicId',
                        params: { publicId: getValue() },
                    } as const;
                    const editHref = {
                        to: '/console/attendance-batches/$publicId/edit',
                        params: { publicId: getValue() },
                    } as const;

                    return (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="icon" aria-label={t('view') ?? 'View'}>
                                <Link {...viewHref}>
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </Button>

                            <Button asChild variant="ghost" size="icon" aria-label={t('edit') ?? 'Edit'}>
                                <Link {...editHref}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>
                            <DeleteAttendanceBatchButon attendanceBatchPublicId={getValue()} />
                        </div>
                    );
                },
            }),
        ];
    }, [t]);

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
