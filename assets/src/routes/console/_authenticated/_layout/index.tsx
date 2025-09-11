import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Coffee, Crown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { fetchEmployees } from '@/services/employee';
import { KpiGantt } from '@/components/kpi/kpi-gantt';
import { useTranslation } from 'react-i18next';
import { NewAttendanceDialog } from '@/components/dialog/new-attendance-dialog';
import { AttendanceGantt } from '@/components/attendance/attendance-gantt';
import { MetricSection } from '@/routes/console/_authenticated/_layout/-components/metric-section';
import { UpcomingLeaves } from '@/routes/console/_authenticated/_layout/-components/upcoming-leaves';
import { RecentEvaluations } from '@/routes/console/_authenticated/_layout/-components/recent-evaluations';
import { DatePicker } from '@/components/picker/date-picker';

export const Route = createFileRoute('/console/_authenticated/_layout/')({
    component: Dashboard,
});

function Dashboard() {
    const { t } = useTranslation();
    const [month, setMonth] = React.useState<Date>(startOfMonth(new Date()));
    const { data: employees = [] } = useQuery({
        queryKey: ['employees', month],
        queryFn: () =>
            fetchEmployees({
                from: startOfMonth(month),
                to: endOfMonth(month),
            }),
    });

    const prevMonth = () => setMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const nextMonth = () => setMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

    return (
        <div className="w-full px-6 py-5 space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 grid place-items-center rounded-xl bg-primary/10 text-primary">
                        <Coffee className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="bg-gradient-to-r from-primary font-bold leading-tight to-primary/60 bg-clip-text text-transparent text-2xl md:text-3xl">
                            Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">Overview for {format(month, 'LLLL yyyy')}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Prev month">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <DatePicker
                            value={month}
                            onChange={(date) => {
                                if (date) {
                                    setMonth(date);
                                }
                            }}
                        />
                        <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <MetricSection month={month} />

            {/* Quick actions */}
            <div className="flex flex-wrap items-center gap-2">
                <Button asChild className="gap-2">
                    <Link to="/console/employees/new">
                        <Plus className="h-4 w-4" />
                        {t('evaluation_templates.employees.add.title', { ns: 'glossary' })}
                    </Link>
                </Button>
                <Button variant="outline" asChild className="gap-2">
                    <Link to="/console/manage/templates/new">
                        <ClipboardList className="h-4 w-4" />
                        {t('evaluations.employee', { ns: 'glossary' })}
                    </Link>
                </Button>
                <Button variant="outline" asChild className="gap-2">
                    <Link to="/console/attendances">
                        <CalendarDays className="h-4 w-4" />
                        Open attendance
                    </Link>
                </Button>
                <NewAttendanceDialog />
                <Badge className="ml-auto" variant="outline">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro • Coming soon
                </Badge>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <SectionHeader
                        title="KPI"
                        action={
                            <Link className="text-sm text-primary hover:underline" to="/console/evaluations/histories">
                                {t('view_all')}
                            </Link>
                        }
                    />
                    <KpiGantt month={month} employees={employees} />

                    <SectionHeader
                        title={t('attendance')}
                        action={
                            <Link className="text-sm text-primary hover:underline" to="/console/attendances">
                                {t('view_all')}
                            </Link>
                        }
                    />
                    <AttendanceGantt month={month} employees={employees} />
                </div>

                <div className="space-y-6">
                    <UpcomingLeaves />
                    <RecentEvaluations />
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {action}
        </div>
    );
}
