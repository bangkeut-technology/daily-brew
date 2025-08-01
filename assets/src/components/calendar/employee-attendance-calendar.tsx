import React from 'react';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import { Employee } from '@/types/employee';
import { useQuery } from '@tanstack/react-query';
import { fetchAttendances } from '@/services/employee';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Attendance } from '@/types/attendance';
import { useTranslation } from 'react-i18next';

interface EmployeeAttendanceCalendarProps {
    employee: Employee;
}

export const EmployeeAttendanceCalendar: React.FunctionComponent<EmployeeAttendanceCalendarProps> = ({ employee }) => {
    const { t } = useTranslation();
    const [month, setMonth] = React.useState<Date>(new Date());
    const { data = [] } = useQuery({
        queryKey: ['employee-attendances', employee.publicId, month],
        queryFn: () =>
            fetchAttendances({
                publicId: employee.publicId,
                from: format(startOfMonth(month), 'yyyy-MM-dd'),
                to: format(endOfMonth(month), 'yyyy-MM-dd'),
            }),
    });

    const attendanceModifiers = React.useMemo(() => {
        const modifiers: Record<string, Attendance> = {};
        data.forEach((attendance) => {
            const date = new Date(attendance.attendanceDate);
            const key = format(date, 'yyyy-MM-dd');
            modifiers[key] = attendance;
        });
        return modifiers;
    }, [data]);

    return (
        <Calendar
            mode="single"
            numberOfMonths={1}
            month={month}
            onMonthChange={setMonth}
            captionLayout="dropdown"
            className="rounded-lg border shadow-sm [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
            formatters={{
                formatMonthDropdown: (date) => {
                    return date.toLocaleString('default', { month: 'long' });
                },
            }}
            components={{
                DayButton: ({ children, modifiers, day, ...props }) => {
                    const attendanceDate = format(day.date, 'yyyy-MM-dd');
                    return (
                        <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                            {children}
                            {attendanceModifiers[attendanceDate] && (
                                <Badge>{t(`attendance_statuses.${attendanceModifiers[attendanceDate].status}`)}</Badge>
                            )}
                        </CalendarDayButton>
                    );
                },
            }}
        />
    );
};
