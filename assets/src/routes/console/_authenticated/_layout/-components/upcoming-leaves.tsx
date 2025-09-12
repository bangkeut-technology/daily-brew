import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchUpcomingAttendances } from '@/services/attendance';
import { AttendanceStatusEnum } from '@/types/attendance';
import { Loading } from '@/components/loader/loading';

export const UpcomingLeaves = () => {
    const { t } = useTranslation();
    const { data = [], isPending } = useQuery({
        queryKey: ['upcoming-leaves'],
        queryFn: () => fetchUpcomingAttendances(AttendanceStatusEnum.leave),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('upcoming_leaves')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                {isPending ? (
                    <Loading loadingText={t('loading.upcoming_leaves', { ns: 'glossary' })} />
                ) : data.length === 0 ? (
                    <p>{t('not_found.upcoming_leaves', { ns: 'glossary' })}</p>
                ) : (
                    data.map((attendance, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="truncate max-w-[55%]">{attendance.employee.fullName}</div>
                            <div className="text-muted-foreground">{format(attendance.attendanceDate, 'MMM d')}</div>
                        </div>
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
