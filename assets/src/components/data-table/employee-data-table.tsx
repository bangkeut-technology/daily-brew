import React from 'react';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/table-core';
import { DataTable } from '@/components/data-table';
import { Employee } from '@/types/employee';
import { RowSelectionState } from '@tanstack/react-table';
import { RemoveEmployeeButton } from '@/components/button/remove-employee-button';

const columnHelper = createColumnHelper<Employee>();

interface EmployeeDataTableProps {
    templatePublicId?: string;
    employees: Employee[];
    loading: boolean;
    onRemoveEmployee?: () => void;
}

export const EmployeeDataTable: React.FunctionComponent<EmployeeDataTableProps> = ({
    employees,
    loading,
    templatePublicId,
    onRemoveEmployee,
}) => {
    const { t } = useTranslation('glossary');
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    const columns = React.useMemo(
        () => [
            columnHelper.accessor('fullName', {
                header: t('employees.table.full_name'),
                cell: (info) => info.getValue(),
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
            columnHelper.accessor('roles', {
                header: t('employees.table.roles'),
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
                header: t('employees.table.kpi_score'),
                cell: (info) => info.getValue().toFixed(2),
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
            columnHelper.accessor('publicId', {
                header: t('employees.table.actions'),
                cell: (info) =>
                    templatePublicId && (
                        <RemoveEmployeeButton
                            templatePublicId={templatePublicId}
                            employeePublicId={info.getValue()}
                            onRemove={onRemoveEmployee}
                        />
                    ),
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
