import React from 'react';
import { Employee } from '@/types/employee';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ClipboardCheck } from 'lucide-react';
import { EmployeeEvaluationTemplates } from '@/components/employee-evaluation-templates';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@/components/picker/date-picker';

interface EmployeeEvaluationButtonProps {
    employee: Employee;
    onSuccess?: () => void;
}

export const EmployeeEvaluationButton: React.FC<EmployeeEvaluationButtonProps> = ({ employee, onSuccess }) => {
    const { t } = useTranslation('glossary');
    const [open, setOpen] = React.useState(false);
    const [evaluatedAt, setEvaluatedAt] = React.useState<Date | undefined>(new Date());

    const handleSuccess = React.useCallback(() => {
        onSuccess?.();
        setOpen(false);
    }, [onSuccess]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <ClipboardCheck />
                    {t('employees.evaluate')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <span>
                            {t('employees.evaluate')} {employee.firstName}
                        </span>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <DatePicker value={evaluatedAt} onChange={setEvaluatedAt} />
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <EmployeeEvaluationTemplates employee={employee} onSuccess={handleSuccess} evaluatedAt={evaluatedAt} />
            </DialogContent>
        </Dialog>
    );
};
