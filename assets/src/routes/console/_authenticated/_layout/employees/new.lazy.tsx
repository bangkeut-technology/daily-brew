import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { EmployeeForm } from '@/components/form/employee-form';
import { useForm } from 'react-hook-form';
import { PartialEmployee } from '@/types/employee';
import { yupResolver } from '@hookform/resolvers/yup';
import { employeeSchema } from '@/schema/employee-schema';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { postEmployee } from '@/services/employee';
import { Send } from 'lucide-react';

export const Route = createLazyFileRoute('/console/_authenticated/_layout/employees/new')({
    component: NewEmployeeComponent,
});

function NewEmployeeComponent() {
    const { t } = useTranslation();
    const { mutate, isPending } = useMutation({
        mutationFn: postEmployee,
        onSuccess: () => {},
    });
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

    const onSubmit = React.useCallback(
        (data: PartialEmployee) => {
            mutate(data);
        },
        [mutate],
    );

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">{t('glossary:employees.new.title')}</h1>
            <p>{t('glossary:employees.new.description')}</p>
            <div className="flex flex-col space-y-2 mt-4">
                <EmployeeForm form={form} isPending={isPending} />
                <Button className="w-full" onClick={form.handleSubmit(onSubmit)}>
                    {t('glossary:employees.new.save')} <Send />
                </Button>
            </div>
        </div>
    );
}
