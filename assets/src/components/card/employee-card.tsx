import React from 'react';
import { Employee } from '@/types/employee';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from '@tanstack/react-router';
import { ClipboardCheck, Eye, UserCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { EmployeeEvaluationTemplates } from '@/components/employee-evaluation-templates';

interface EmployeeCardProps {
    employee: Employee;
    from: string;
    to: string;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, from, to }) => {
    const { t } = useTranslation('glossary');
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);

    const handleClick = React.useCallback(() => {
        navigate({
            to: '/console/employees/$identifier',
            params: { identifier: employee.identifier },
            search: { from, to },
        }).then();
    }, [employee.identifier, from, navigate, to]);

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
                        <div className="p-2 rounded-4xl bg-primary min-w-[69px] min-h-[69px] flex items-center justify-center">
                            <h1 className="text-2xl font-bold text-foreground">{employee.averageScore.toFixed(2)}</h1>
                        </div>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="w-full space-y-2">
                <Button size="sm" className="w-full" onClick={handleClick}>
                    <Eye />
                    {t('employees.view')}
                </Button>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" size="sm">
                            <ClipboardCheck />
                            {t('employees.evaluate')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {t('employees.evaluate')} {employee.firstName}
                            </DialogTitle>
                        </DialogHeader>
                        <EmployeeEvaluationTemplates employee={employee} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
