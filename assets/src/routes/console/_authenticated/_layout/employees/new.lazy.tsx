import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { EmployeeForm } from '@/components/form/employee-form';
import { useForm } from 'react-hook-form';
import { PartialEmployee } from '@/types/employee';
import { yupResolver } from '@hookform/resolvers/yup';
import { employeeSchema } from '@/schema/employee-schema';

export const Route = createLazyFileRoute('/console/_authenticated/_layout/employees/new')({
    component: NewEmployeeComponent,
});

function NewEmployeeComponent() {
    const { t } = useTranslation();
    const form = useForm<PartialEmployee>({
        resolver: yupResolver(employeeSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            phoneNumber: '',
            dob: undefined,
            joinedAt: undefined,
            roles: [],
        },
    });

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{t('glossary:employees.new.title')}</h1>
            <p>{t('glossary:employees.new.description')}</p>
            <div>
                <EmployeeForm form={form} />
            </div>
        </div>
    );
}
