import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { EmployeeEvaluationTemplates } from '@/components/employee-evaluation-templates';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { fetchEmployee } from '@/services/employee';
import { format } from 'date-fns';
import { DatePicker } from '@/components/picker/date-picker';
import { EmployeePicker } from '@/components/picker/employee-picker';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/evaluate')({
    component: NewEvaluation,
});

function NewEvaluation() {
    const { t } = useTranslation();
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [employeeId, setEmployeeId] = React.useState<string>('');
    const dateISO = format(date || new Date(), 'yyyy-MM-dd');
    const { data: employee } = useQuery({
        queryKey: ['employee', dateISO, employeeId],
        queryFn: () => fetchEmployee({ publicId: employeeId, from: dateISO, to: dateISO }),
        enabled: !!employeeId,
    });

    return (
        <div className="w-full px-6 py-5 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold">{t('evaluate.employee', { ns: 'glossary' })}</h1>
                <div className="flex items-center gap-2">
                    <DatePicker value={date} onChange={setDate} />
                </div>
            </div>

            <React.Fragment>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('evaluations.who', { ns: 'glossary' })}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        <EmployeePicker
                            className="w-full"
                            label={t('employee')}
                            value={employeeId}
                            onChange={setEmployeeId}
                        />

                        <div className="flex flex-col space-y-2">
                            <Label>{t('employees.kpi_score', { ns: 'glossary' })}</Label>
                            <div className="h-10 grid place-items-center rounded-md border text-lg font-semibold">
                                {employee?.averageScore ?? '—'}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {employee && (
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle>{t('employee_evaluations.title', { ns: 'glossary' })}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <EmployeeEvaluationTemplates employee={employee} />
                        </CardContent>
                    </Card>
                )}
            </React.Fragment>
        </div>
    );
}
