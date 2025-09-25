import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAttendances } from '@/services/attendance';
import { DataTable } from '@/components/data-table';
import { RowSelectionState } from '@tanstack/react-table';
import { createColumnHelper } from '@tanstack/table-core';
import { Attendance, AttendanceSearchParams } from '@/types/attendance';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { DISPLAY_DATE_FORMAT, DISPLAY_TIME_FORMAT } from '@/constants/date';
import { AttendanceTypeBadge } from '@/components/attendance/attendance-type-badge';

const columnHelper = createColumnHelper<Attendance>();

interface AttendanceDataTableProps {
    params: AttendanceSearchParams;
}

export const AttendanceDataTable: React.FunctionComponent<AttendanceDataTableProps> = ({ params }) => {
    const { t } = useTranslation();
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const { data = [], isPending } = useQuery({
        queryKey: ['attendances', params],
        queryFn: () => fetchAttendances(params),
    });

    const columns = React.useMemo(() => {
        return [
            columnHelper.accessor('employee.fullName', {
                header: t('employee'),
                cell: ({ getValue }) => getValue(),
            }),
            columnHelper.accessor('type', {
                header: t('type'),
                cell: ({ getValue }) => <AttendanceTypeBadge type={getValue()} />,
            }),
            columnHelper.accessor('attendanceDate', {
                header: t('attendance_date'),
                cell: ({ getValue }) => format(getValue(), DISPLAY_DATE_FORMAT),
            }),
            columnHelper.accessor('clockIn', {
                header: t('clock_in'),
                cell: ({ getValue }) => {
                    const time = getValue();
                    if (time) {
                        return format(time, DISPLAY_TIME_FORMAT);
                    }
                    return '-';
                },
            }),
            columnHelper.accessor('clockOut', {
                header: t('clock_out'),
                cell: ({ getValue }) => {
                    const time = getValue();
                    if (time) {
                        return format(time, DISPLAY_TIME_FORMAT);
                    }
                    return '-';
                },
            }),
            columnHelper.accessor('user.fullName', {
                header: t('recorded_by'),
                cell: ({ getValue }) => getValue(),
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
