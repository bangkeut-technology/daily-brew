import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { fetchEmployees } from '@/services/employee';
import { useTranslation } from 'react-i18next';
import { useApplication } from '@/hooks/use-application';
import { UserPlus2 } from 'lucide-react';
import { EmployeeCard } from '@/components/card/employee-card';
import { z } from 'zod';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/console/_authenticated/_layout/employees/')({
    component: Employees,
    validateSearch: z.object({
        from: z.string().default(format(startOfMonth(new Date()), 'yyyy-MM-dd')),
        to: z.string().default(format(endOfMonth(new Date()), 'yyyy-MM-dd')),
    }),
});

function Employees() {
    const { t } = useTranslation();
    const { from, to } = Route.useSearch();
    const { maxFreeEmployees } = useApplication();
    const queryClient = useQueryClient();
    const { data = [] } = useQuery({
        queryKey: ['employees', from, to],
        queryFn: () => fetchEmployees({ from, to }),
    });

    const onSuccess = React.useCallback(() => {
        queryClient
            .invalidateQueries({
                queryKey: ['employees'],
            })
            .then();
    }, [queryClient]);

    return (
        <div className="p-4">
            <div className="flex gap-2">
                <h1 className="text-2xl font-bold mb-4">{t('employees.title', { ns: 'glossary' })}</h1>
                <Button variant="outline" asChild>
                    <Link to="/console/employees/new" className="flex items-center gap-2">
                        {t('employees.add', { ns: 'glossary' })} <UserPlus2 />
                    </Link>
                </Button>
            </div>
            <p>{t('employees.description', { maxFreeEmployees: maxFreeEmployees, ns: 'glossary' })}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {data.map((employee) => (
                    <EmployeeCard
                        key={employee.publicId}
                        employee={employee}
                        from={from}
                        to={to}
                        onSuccess={onSuccess}
                    />
                ))}
            </div>
        </div>
    );
}
