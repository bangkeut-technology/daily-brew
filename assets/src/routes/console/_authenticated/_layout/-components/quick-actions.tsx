import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { CalendarDays, ClipboardList, Crown, Plus } from 'lucide-react';
import { NewAttendanceDialog } from '@/components/dialog/new-attendance-dialog';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export const QuickActions = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="gap-2">
                <Link to="/console/employees/new">
                    <Plus className="h-4 w-4" />
                    {t('evaluation_templates.employees.add.title', { ns: 'glossary' })}
                </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
                <Link to="/console/manage/templates/new">
                    <ClipboardList className="h-4 w-4" />
                    {t('evaluations.employee', { ns: 'glossary' })}
                </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
                <Link to="/console/attendances">
                    <CalendarDays className="h-4 w-4" />
                    Open attendance
                </Link>
            </Button>
            <NewAttendanceDialog />
            <Badge className="ml-auto" variant="outline">
                <Crown className="h-3 w-3 mr-1" />
                Pro • Coming soon
            </Badge>
        </div>
    );
};
