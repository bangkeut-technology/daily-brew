import React from 'react';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { fetchEmployees } from '@/services/employee';
import { useTranslation } from 'react-i18next';
import { useApplication } from '@/hooks/use-application';
import { CardButton } from '@/components/button/card-button';
import { UserPlus2 } from 'lucide-react';

export const Route = createFileRoute('/console/_authenticated/_layout/employees/')({
    component: Employees,
    loader: () => fetchEmployees(),
    validateSearch: (search) => {
        return {
            redirect: search.redirect || '/console',
        };
    },
    beforeLoad: ({ context, search }) => {
        if (!context.authentication?.isAuthenticated) {
            throw redirect({ to: (search.redirect as any) || '/console/sign-in' });
        }
    },
});

function Employees() {
    const { t } = useTranslation();
    const { maxFreeEmployees } = useApplication();
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
            </div>
        </div>
    );
}
