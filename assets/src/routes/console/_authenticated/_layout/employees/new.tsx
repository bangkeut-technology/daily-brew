import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
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
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { z } from 'zod';
import { endOfMonth, format, startOfMonth } from 'date-fns';

export const Route = createFileRoute('/console/_authenticated/_layout/employees/new')({
    component: NewEmployeeComponent,
    validateSearch: z.object({
        from: z.string().default(format(startOfMonth(new Date()), 'yyyy-MM-dd')),
        to: z.string().default(format(endOfMonth(new Date()), 'yyyy-MM-dd')),
    }),
    loaderDeps: ({ search: { from, to } }) => ({
        from,
        to,
    }),
});

function NewEmployeeComponent() {
    const { t } = useTranslation();
    const navigate = Route.useNavigate();
    const { from, to } = Route.useSearch();
    const { mutate, isPending } = useMutation({
        mutationFn: postEmployee,
        onSuccess: (response) => {
            toast.success(response.message);
            navigate({
                to: '/console/employees/$identifier',
                params: { identifier: response.employee.identifier },
                search: { from, to },
            }).then();
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
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
            template: undefined,
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
            <h1 className="text-2xl font-bold mb-4">{t('employees.new.title', { ns: 'glossary' })}</h1>
            <p>{t('employees.new.description', { ns: 'glossary' })}</p>
            <div className="flex flex-col space-y-2 mt-4">
                <EmployeeForm form={form} isPending={isPending} />
                <Button className="w-full" onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                    {t('employees.new.save', { ns: 'glossary' })} <Send />
                </Button>
            </div>
        </div>
    );
}
