import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/loader/loading';
import { fetchEmployees, fetchRole } from '@/services/role';
import { NewRoleDialog } from '@/components/dialog/new-role-dialog';
import { RoleNotFound } from '@/routes/console/_authenticated/_layout/manage/roles/-role-not-found';
import { EmployeeDataTable } from '@/components/data-table/employee-data-table';
import { useQuery } from '@tanstack/react-query';

export const Route = createFileRoute('/console/_authenticated/_layout/manage/roles/$publicId')({
    component: RolePage,
    loader: ({ params: { publicId } }) => fetchRole(publicId),
    pendingComponent: () => <Loading loadingText="Loading role details..." />,
    errorComponent: () => <RoleNotFound />,
});

function RolePage() {
    const role = Route.useLoaderData();

    const { data: employees = [], isPending } = useQuery({
        queryKey: ['role-employees', role.publicId],
        queryFn: () => fetchEmployees(role.publicId),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold">Role Details</h1>
                </div>

                <NewRoleDialog />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{role.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div>
                        <span className="font-medium text-muted-foreground">Canonical Name: </span>
                        {role.canonicalName}
                    </div>
                    {role.description && (
                        <div>
                            <span className="font-medium text-muted-foreground">Description: </span>
                            {role.description}
                        </div>
                    )}
                    <div>
                        <span className="font-medium text-muted-foreground">Public ID: </span>
                        {role.publicId}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle>Employees</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {isPending ? 'Loading employees…' : `${employees.length} assigned`}
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <EmployeeDataTable employees={employees} loading={isPending} />
                </CardContent>
            </Card>
        </div>
    );
}
