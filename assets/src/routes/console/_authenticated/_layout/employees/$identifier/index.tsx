import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { fetchEmployee } from '@/services/employee';

export const Route = createFileRoute('/console/_authenticated/_layout/employees/$identifier/')({
    component: EmployeeDetails,
    loader: ({ params }) => fetchEmployee(params.identifier),
});

function EmployeeDetails() {
    return <div></div>;
}
