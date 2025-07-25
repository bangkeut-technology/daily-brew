import React from 'react';
import { useTranslation } from 'react-i18next';
import { createColumnHelper } from '@tanstack/table-core';
import { DataTable } from '@/components/data-table';
import { Employee } from '@/types/employee';
import { RowSelectionState } from '@tanstack/react-table';

const columnHelper = createColumnHelper<Employee>();

interface EmployeeDataTableProps {
    employees: Employee[];
    loading: boolean;
}

export const EmployeeDataTable: React.FunctionComponent<EmployeeDataTableProps> = ({ employees, loading }) => {
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
    const { t } = useTranslation('glossary');

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
        ],
        [t],
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
