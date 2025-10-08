import React from 'react';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/table-core';
import { DataTable } from '@/components/data-table';
import { Employee } from '@/types/employee';
import { RowSelectionState } from '@tanstack/react-table';
import { RemoveEmployeeButton } from '@/components/button/remove-employee-button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Eye, Gauge, MoreHorizontal, Pencil } from 'lucide-react';
import { DeleteEmployeeButton } from '@/components/button/delete-employee-button';
import { useNavigate, useSearch } from '@tanstack/react-router';

const columnHelper = createColumnHelper<Employee>();

interface EmployeeDataTableProps {
    templatePublicId?: string;
    employees: Employee[];
    loading?: boolean;

    onRemoveEmployee?: () => void;
}

export const EmployeeDataTable: React.FunctionComponent<EmployeeDataTableProps> = ({
    employees,
    loading,
    templatePublicId,
    onRemoveEmployee,
}) => {
    const { t } = useTranslation();
    const { from, to } = useSearch({ from: '/console/_authenticated/_layout/employees/' });
    const navigate = useNavigate();
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const columns = React.useMemo(
        () => [
            columnHelper.accessor('fullName', {
                header: t('employees.table.full_name', { ns: 'glossary' }),
                cell: (info) => info.getValue(),
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
            columnHelper.accessor('roles', {
                header: t('employees.table.roles', { ns: 'glossary' }),
                cell: (info) =>
                    info
                        .getValue()
                        .map((role) => role.name)
                        .join(', '),
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
            columnHelper.accessor('averageScore', {
                header: t('employees.table.kpi_score', { ns: 'glossary' }),
                cell: (info) => info.getValue().toFixed(2),
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
            columnHelper.accessor('publicId', {
                header: t('actions'),
                cell: ({ getValue, row: { original } }) => {
                    const employeePublicId = getValue();
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() =>
                                        navigate({
                                            to: '/console/employees/$publicId',
                                            params: { publicId: employeePublicId },
                                            search: { from, to },
                                        })
                                    }
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t('view')}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => console.log('Edit', employeePublicId)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t('edit')}
                                </DropdownMenuItem>
                                {templatePublicId && (
                                    <DropdownMenuItem asChild>
                                        <RemoveEmployeeButton
                                            templatePublicId={templatePublicId}
                                            employeePublicId={employeePublicId}
                                            onRemove={onRemoveEmployee}
                                        />
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => console.log('View KPI', employeePublicId)}>
                                    <Gauge className="mr-2 h-4 w-4" />
                                    {t('view_kpi')}
                                </DropdownMenuItem>
                            </DropdownMenuContent>

                            <DeleteEmployeeButton
                                employeePublicId={employeePublicId}
                                employeeName={original.fullName}
                                onDeleted={onRemoveEmployee}
                                variant="ghost"
                                className="text-red-500 hover:text-red-200"
                                size="icon"
                            />
                        </DropdownMenu>
                    );
                },
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
        ],
        [t, templatePublicId, onRemoveEmployee],
    );

    return (
        <DataTable
            data={employees}
            columns={columns}
            loading={loading}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
        />
    );
};

EmployeeDataTable.displayName = 'EmployeeDataTable';
