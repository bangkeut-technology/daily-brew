import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RolesDataTable } from '@/routes/console/_authenticated/_layout/manage/roles/-roles-data-table';
import { NewRoleDialog } from '@/components/dialog/new-role-dialog';

export const Route = createFileRoute('/console/_authenticated/_layout/manage/roles/')({
    component: RolesPage,
});

function RolesPage() {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">{t('roles.title', { defaultValue: 'Roles' })}</h1>
                <NewRoleDialog />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>{t('roles.list_title', { defaultValue: 'Employee Roles' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <RolesDataTable />
                </CardContent>
            </Card>
        </div>
    );
}
