import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { fetchEmployee } from '@/services/employee';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { EmployeeEvaluationTemplates } from '@/components/employee-evaluation-templates';
import { z } from 'zod';

export const Route = createFileRoute('/console/_authenticated/_layout/employees/$identifier/')({
    component: EmployeeDetails,
    loaderDeps: ({ search: { from, to } }) => ({
        from,
        to,
    }),
    loader: ({ params }) => fetchEmployee(params.identifier),
    validateSearch: z.object({
        from: z.string(),
        to: z.string(),
    }),
});

function EmployeeDetails() {
    const { t } = useTranslation();
    const employee = Route.useLoaderData();

    return (
        <div className="w-full h-full">
            <h1 className="text-2xl font-bold">{t('employees.details.title', { ns: 'glossary' })}</h1>
            <p>{t('employees.details.description', { ns: 'glossary' })}</p>
            <Card className="mt-4">
                <CardContent className="space-y-2 p-6 space-x-2">
                    <h2 className="text-xl font-semibold">
                        {employee.lastName} {employee.firstName}
                    </h2>
                    <p className="">{t('employees.roles.title', { ns: 'glossary' })}</p>
                    <ul>
                        {employee.roles.map((role) => (
                            <li key={role.id}>{role.name}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <h1>{t('employee_evaluations.new.title', { ns: 'glossary' })}</h1>
            <p>{t('employee_evaluations.new.description', { ns: 'glossary' })}</p>
            <EmployeeEvaluationTemplates employee={employee} />
        </div>
    );
}
