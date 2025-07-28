import React from 'react';
import { Employee } from '@/types/employee';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { Eye, UserCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { EmployeeEvaluationButton } from '@/components/button/employee-evaluation-button';

interface EmployeeCardProps {
    employee: Employee;
    from: string;
    to: string;
    onSuccess?: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, from, to, onSuccess }) => {
    const { t } = useTranslation('glossary');
    const navigate = useNavigate();

    const handleClick = React.useCallback(() => {
        navigate({
            to: '/console/employees/$publicId',
            params: { publicId: employee.publicId },
            search: { from, to },
        }).then();
    }, [employee.publicId, from, navigate, to]);

    return (
        <div className="flex flex-col p-4 border rounded-lg hover:bg-primary/5 space-y-2">
            <div className="flex space-x-2">
                <div className="space-y-2 flex flex-col grow">
                    <div className="flex space-x-2 items-center">
                        <UserCircle className="text-primary" aria-hidden="true" focusable="false" />
                        <h2 className="text-xl font-semibold">{`${employee.firstName} ${employee.lastName}`}</h2>
                    </div>
                    <p className="text-muted-foreground text-sm">{t(`employees.status.${employee.status}`)}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {employee.roles.map((role) => (
                            <span
                                key={`role-${role.canonicalName}`}
                                className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                            >
                                {role.name}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-center px-4 gap-3">
                    <Separator orientation="vertical" />

                    <div className="flex flex-col space-y-2 items-center justify-center">
                        <p className="text-sm text-muted-foreground">{t('employees.kpi_score')}</p>
                        <h1 className="text-4xl font-bold text-primary">{employee.averageScore}</h1>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="w-full space-y-2">
                <Button size="sm" className="w-full" onClick={handleClick}>
                    <Eye />
                    {t('employees.view')}
                </Button>
                <EmployeeEvaluationButton employee={employee} onSuccess={onSuccess} />
            </div>
        </div>
    );
};
