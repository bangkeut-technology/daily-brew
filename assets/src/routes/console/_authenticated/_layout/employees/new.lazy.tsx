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
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

export const Route = createLazyFileRoute('/console/_authenticated/_layout/employees/new')({
    component: NewEmployeeComponent,
});

function NewEmployeeComponent() {
    const { t } = useTranslation();
    const navigate = Route.useNavigate();
    const { mutate, isPending } = useMutation({
        mutationFn: postEmployee,
        onSuccess: (response) => {
            toast.success(response.message);
            navigate({
                to: '/console/employees/$identifier',
                params: { identifier: response.employee.identifier },
            }).then();
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('error:occurred');
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
                <Button
                    className="w-full"
                    onClick={form.handleSubmit(onSubmit, (errors) => console.error(errors))}
                    disabled={isPending}
                >
                    {t('glossary:employees.new.save')} <Send />
                </Button>
            </div>
        </div>
    );
}
