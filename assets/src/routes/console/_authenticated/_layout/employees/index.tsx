import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { fetchEmployees } from '@/services/employee';
import { useTranslation } from 'react-i18next';
import { useApplication } from '@/hooks/use-application';
import { CardButton } from '@/components/button/card-button';
import { UserPlus2 } from 'lucide-react';
import { EmployeeCard } from '@/components/card/employee-card';
import { z } from 'zod';
import { Employee } from '@/types/employee';
import { endOfMonth, format, startOfMonth } from 'date-fns';

export const Route = createFileRoute('/console/_authenticated/_layout/employees/')({
    component: Employees,
    loaderDeps: ({ search: { from, to } }) => ({
        from,
        to,
    }),
    loader: ({ deps: { from, to } }) => fetchEmployees({ from, to }),
    validateSearch: z.object({
        from: z.string().default(format(startOfMonth(new Date()), 'yyyy-MM-dd')),
        to: z.string().default(format(endOfMonth(new Date()), 'yyyy-MM-dd')),
    }),
});

function Employees() {
    const { t } = useTranslation();
    const navigate = Route.useNavigate();
    const { from, to } = Route.useSearch();
    const { maxFreeEmployees } = useApplication();
    const employees = Route.useLoaderData();

    const handleClick = React.useCallback(
        (employee: Employee) => {
            navigate({
                to: '/console/employees/$identifier',
                params: { identifier: employee.identifier },
                search: { from, to },
            });
        },
        [from, navigate, to],
    );

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{t('employees.title', { ns: 'glossary' })}</h1>
            <p>{t('employees.description', { maxFreeEmployees: maxFreeEmployees, ns: 'glossary' })}</p>
            <div className="mt-4 flex flex-row gap-4">
                <CardButton asChild>
                    <Link to="/console/employees/new" className="flex items-center gap-2">
                        {t('employees.add', { ns: 'glossary' })} <UserPlus2 className="w-6 h-6" />
                    </Link>
                </CardButton>
                {employees.map((employee) => (
                    <EmployeeCard employee={employee} onClick={handleClick} key={employee.identifier} />
                ))}
            </div>
        </div>
    );
}
