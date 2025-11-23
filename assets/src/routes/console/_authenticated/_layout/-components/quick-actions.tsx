import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ClipboardList, Crown, Plus } from 'lucide-react';
import { NewAttendanceDialog, NewAttendanceDialogRefProps } from '@/components/dialog/new-attendance-dialog';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { NewAttendanceBatchDialog } from '@/components/dialog/new-attendance-batch-dialog';
import { Employee } from '@/types/employee';
import { Attendance } from '@/types/attendance';

type QuickActionsProps = object;

export interface QuickActionsRefProps {
    setAttendance: React.Dispatch<React.SetStateAction<Attendance | undefined>>;
    setEmployee: React.Dispatch<React.SetStateAction<Employee | undefined>>;
    setAttendanceDate: React.Dispatch<React.SetStateAction<Date>>;
    opensNewAttendanceDialog: () => void;
}

export const QuickActions = React.forwardRef<QuickActionsRefProps, QuickActionsProps>((_, ref) => {
    const { t } = useTranslation();
    const [attendance, setAttendance] = React.useState<Attendance>();
    const [attendanceDate, setAttendanceDate] = React.useState<Date>(new Date());
    const [employee, setEmployee] = React.useState<Employee>();
    const newAttendanceDialogRef = React.useRef<NewAttendanceDialogRefProps>(null);

    React.useImperativeHandle(ref, () => ({
        setAttendanceDate,
        setAttendance,
        setEmployee,
        opensNewAttendanceDialog: () => newAttendanceDialogRef.current?.openDialog(),
    }));

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="gap-2">
                <Link to="/console/employees/new">
                    <Plus className="h-4 w-4" />
                    {t('evaluation_templates.employees.add.title', { ns: 'glossary' })}
                </Link>
            </Button>
            <Button asChild className="bg-orange-500 gap-2 hover:bg-orange-500/90">
                <Link to="/console/manage/templates/new">
                    <ClipboardList className="h-4 w-4" />
                    {t('evaluations.employee', { ns: 'glossary' })}
                </Link>
            </Button>
            <NewAttendanceDialog
                attendance={attendance}
                attendanceDate={attendanceDate}
                employee={employee}
                ref={newAttendanceDialogRef}
            />
            <NewAttendanceBatchDialog />
            <Badge className="ml-auto" variant="outline">
                <Crown className="h-3 w-3 mr-1" />
                Pro • Coming soon
            </Badge>
        </div>
    );
});

QuickActions.displayName = 'QuickActions';
