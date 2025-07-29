import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { fetchEmployee } from '@/services/employee';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { EmployeeEvaluationButton } from '@/components/button/employee-evaluation-button';
import { BackButton } from '@/components/button/back-button';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, UserRoundX } from 'lucide-react';
import { EditEmployeeDialog } from '@/components/dialog/edit-employee-dialog';

export const Route = createFileRoute('/console/_authenticated/_layout/employees/$publicId/')({
    component: EmployeeDetails,
    validateSearch: z.object({
        from: z.string(),
        to: z.string(),
    }),
});

function EmployeeDetails() {
    const { t } = useTranslation();
    const { publicId } = Route.useParams();
    const { from, to } = Route.useSearch();
    const queryClient = useQueryClient();
    const { data: employee, isPending } = useQuery({
        queryKey: ['employee', publicId, from, to],
        queryFn: () => fetchEmployee({ publicId, from, to }),
    });

    const onSuccess = React.useCallback(() => {
        queryClient
            .invalidateQueries({
                queryKey: ['employee', publicId, from, to],
            })
            .then();
    }, [from, publicId, queryClient, to]);

    if (isPending) {
        return (
            <div className="w-full h-full flex flex-col justify-center items-center">
                <Loader2 className="animate-spin w-16 h-16 mb-4" />
                <h4>{t('employees.loading', { ns: 'glossary' })}</h4>
            </div>
        );
    }

    if (employee) {
        return (
            <div className="w-full px-6 py-4 space-y-6">
                <div className="space-y-2">
                    <BackButton />

                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                        <h1 className="text-3xl font-bold">
                            {employee.firstName} {employee.lastName}
                        </h1>
                        <EditEmployeeDialog employee={employee} onSuccess={onSuccess} />
                        <EmployeeEvaluationButton employee={employee} />
                    </div>
                </div>

                <div className="flex flex-col gap-6 sm:grid sm:grid-cols-1 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('employees.information', { ns: 'glossary' })}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground flex flex-col gap-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span>{t('employees.status.title', { ns: 'glossary' })}:</span>
                                <Badge variant="outline">
                                    {t(`employees.status.${employee.status}`, { ns: 'glossary' })}
                                </Badge>
                            </div>
                            {employee.phoneNumber && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span>{t('employees.phone_number', { ns: 'glossary' })}:</span>
                                    <span className="font-semibold text-foreground">{employee.phoneNumber}</span>
                                </div>
                            )}
                            {employee.dob && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span>{t('employees.dob', { ns: 'glossary' })}:</span>
                                    <span className="font-semibold text-foreground">{format(employee.dob, 'PPP')}</span>
                                </div>
                            )}
                            {employee.joinedAt && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span>{t('employees.joined_at', { ns: 'glossary' })}:</span>
                                    <span className="font-semibold text-foreground">
                                        {format(new Date(employee.joinedAt), 'PPP')}
                                    </span>
                                </div>
                            )}
                            <div className="flex flex-col">
                                <span>{t('employees.roles.title', { ns: 'glossary' })}:</span>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {employee.roles.map((role) => (
                                        <Badge key={role.canonicalName} variant="secondary">
                                            {role.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('employees.performance.title', { ns: 'glossary' })}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center">
                                <p className="text-muted-foreground">{t('employees.kpi_score', { ns: 'glossary' })}</p>
                                <h2 className="text-4xl font-bold text-primary">{employee.averageScore ?? 'N/A'}</h2>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex justify-center items-center">
            <UserRoundX className="w-16 h-16 mb-4" />
            <p className="text-lg text-muted-foreground">{t('employees.not_found', { ns: 'glossary' })}</p>
        </div>
    );
}
