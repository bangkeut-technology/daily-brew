import React from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { fetchEmployees } from '@/services/employee';

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
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Employees</h1>
            <p>Employee management features will be implemented here.</p>
        </div>
    );
}
