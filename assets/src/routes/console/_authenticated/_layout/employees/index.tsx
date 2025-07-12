import React from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { fetchEmployees } from '@/services/employee';
import { useTranslation } from 'react-i18next';

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
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{t('glossary:employees.title')}</h1>
            <p>{t('glossary:employees.description', { maximumEmployee: 10 })}</p>
        </div>
    );
}
