import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { UserPlus2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchEmployees } from '@/services/employee';
import {
    EmployeeSearchForm,
    EmployeeSearchParams,
} from '@/routes/console/_authenticated/_layout/employees/-components/employee-search-form';
import { DATE_FORMAT } from '@/constants/date';
import { useApplication } from '@/hooks/use-application';
import { EmployeeDataTable } from '@/components/data-table/employee-data-table';

export const Route = createFileRoute('/console/_authenticated/_layout/employees/')({
    validateSearch: z.object({
        q: z.string().optional(),
        status: z.enum(['active', 'on_leave', 'suspended', 'resigned', 'probation']).optional(),
        role: z.string().optional(),
        from: z.string().default(format(startOfMonth(new Date()), DATE_FORMAT)),
        to: z.string().default(format(endOfMonth(new Date()), DATE_FORMAT)),
    }),
    component: EmployeesPage,
});

function EmployeesPage() {
    const { t } = useTranslation();
    const { maxFreeEmployees } = useApplication();
    const navigate = Route.useNavigate();
    const { from, to, q, role, status } = Route.useSearch();
    const [params, setParams] = React.useState<EmployeeSearchParams>({
        role: role || '',
        q: q || '',
        from: new Date(from),
        to: new Date(to),
        status,
    });
    const { data: employees = [], isFetching } = useQuery({
        queryKey: ['employees', params],
        queryFn: () => fetchEmployees(params),
    });

    const onSearch = React.useCallback(() => {
        navigate({
            search: {
                from: params.from ? format(params.from, DATE_FORMAT) : undefined,
                to: params.to ? format(params.to, DATE_FORMAT) : undefined,
                q: params.q || undefined,
                role: params.role || undefined,
                status: params.status || undefined,
            },
        });
    }, [navigate, params.from, params.q, params.role, params.status, params.to]);

    const onReset = React.useCallback(() => {
        setParams({
            role: role || '',
            q: q || '',
            from: new Date(from),
            to: new Date(to),
            status,
        });
        navigate({
            search: {
                role: role || '',
                q: q || '',
                from: format(from, DATE_FORMAT),
                to: format(to, DATE_FORMAT),
                status,
            },
        });
    }, [from, navigate, q, role, status, to]);

    return (
        <div className="w-full px-6 py-5 space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">{t('employees.title', { ns: 'glossary' })}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('employees.description', { maxFreeEmployees: maxFreeEmployees, ns: 'glossary' })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild className="gap-2">
                        <Link to="/console/employees/new">
                            <UserPlus2 className="h-4 w-4" />
                            {t('employees.add', { ns: 'glossary' })}
                        </Link>
                    </Button>
                </div>
            </div>

            <EmployeeSearchForm
                params={params}
                onSearch={onSearch}
                onReset={onReset}
                onChange={(patch) => setParams((prevState) => ({ ...prevState, ...patch }))}
            />

            <EmployeeDataTable employees={employees} loading={isFetching} />
        </div>
    );
}
