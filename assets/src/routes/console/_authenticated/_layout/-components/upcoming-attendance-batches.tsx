import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Loading } from '@/components/loader/loading';
import { fetchUpcomingAttendanceBatches } from '@/services/attendance-batch';
import { AttendanceTypeBadge } from '@/components/attendance/attendance-type-badge';
import { CalendarRange } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const UpcomingAttendanceBatches = () => {
    const { t } = useTranslation();
    const { data = [], isPending } = useQuery({
        queryKey: ['upcoming-attendance-batches'],
        queryFn: () => fetchUpcomingAttendanceBatches(),
    });

    return (
        <Card>
            <CardHeader className="flex items-center space-x-2">
                <CalendarRange className="w-5 h-5 text-muted-foreground" />
                <CardTitle>{t('upcoming_attendance_batches')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                {isPending ? (
                    <Loading loadingText={t('loading.upcoming_attendance_batches', { ns: 'glossary' })} />
                ) : data.length === 0 ? (
                    <p>{t('not_found.upcoming_attendance_batches', { ns: 'glossary' })}</p>
                ) : (
                    data.map((batch) => (
                        <Tooltip key={batch.publicId}>
                            <TooltipTrigger asChild>
                                <div className="flex items-center justify-between">
                                    <div className="truncate max-w-[55%] cursor-default">{batch.label}</div>
                                    <AttendanceTypeBadge type={batch.type} />
                                    <div className="text-muted-foreground">
                                        {format(batch.fromDate, 'MMM d')} – {format(batch.toDate, 'MMM d')}
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                {batch.employees?.length ? (
                                    <ul className="space-y-1">
                                        {batch.employees.map((employee, j) => (
                                            <li key={j}>{employee.fullName}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span>No employees</span>
                                )}
                            </TooltipContent>
                        </Tooltip>
                    ))
                )}
                <Separator />
                <Button variant="ghost" asChild className="w-full">
                    <Link to="/console/attendances">{t('open.leave_board')}</Link>
                </Button>
            </CardContent>
        </Card>
    );
};
