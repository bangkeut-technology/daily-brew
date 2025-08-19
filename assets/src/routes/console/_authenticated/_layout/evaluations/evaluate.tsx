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

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/evaluate')({
    component: NewEvaluation,
});

function NewEvaluation() {
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
                <h1 className="text-2xl md:text-3xl font-bold">Evaluate</h1>
                <div className="flex items-center gap-2">
                    <DatePicker value={date} onChange={setDate} />
                </div>
            </div>

            {employee && (
                <React.Fragment>
                    <Card>
                        <CardHeader>
                            <CardTitle>Who & What</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-3">
                            <EmployeePicker value={employeeId} onChange={setEmployeeId} />

                            {/* Average */}
                            <div className="space-y-1">
                                <Label>Average (weighted)</Label>
                                <div className="h-10 grid place-items-center rounded-md border text-lg font-semibold">
                                    {employee?.averageScore ?? '—'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle>Criteria</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <EmployeeEvaluationTemplates employee={employee} />
                        </CardContent>
                    </Card>
                </React.Fragment>
            )}
        </div>
    );
}
