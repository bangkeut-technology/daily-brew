import React from 'react';
import { Employee } from '@/types/employee';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ClipboardCheck } from 'lucide-react';
import { EmployeeEvaluationTemplates } from '@/components/employee-evaluation-templates';
import { useTranslation } from 'react-i18next';

interface EmployeeEvaluationButtonProps {
    employee: Employee;
    onSuccess?: () => void;
}

export const EmployeeEvaluationButton: React.FC<EmployeeEvaluationButtonProps> = ({ employee, onSuccess }) => {
    const { t } = useTranslation('glossary');
    const [open, setOpen] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
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
                <EmployeeEvaluationTemplates employee={employee} onSuccess={onSuccess} />
            </DialogContent>
        </Dialog>
    );
};
