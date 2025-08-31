import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEmployees } from '@/services/employee';
import { createColumnHelper } from '@tanstack/table-core';
import { Employee } from '@/types/employee';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/data-table';
import { RowSelectionState } from '@tanstack/react-table';
import { Control, useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<Employee>();
const queryKey = ['employees'];

interface MultipleEmployeesSelectProps {
    control: Control<any>;
    valueProp?: keyof Employee;
    name: string;
    title?: string;
    description?: string;
}

export const MultipleEmployeesSelect: React.FunctionComponent<MultipleEmployeesSelectProps> = ({
    control,
    valueProp = 'publicId',
    name,
    title,
    description,
}) => {
    const [employees, setEmployees] = React.useState<RowSelectionState>({});
    const { t } = useTranslation();
    const { replace } = useFieldArray({
        name,
        control,
    });
    const { data = [] } = useQuery({
        queryKey,
        queryFn: () => fetchEmployees({ from: new Date(), to: new Date() }),
    });

    React.useEffect(() => {
        const selectedRows = Object.keys(employees).map((value) => data[Number(value)]);
        replace(selectedRows.map((employee) => ({ value: employee.id })));
    }, [data, replace, employees]);

    const columns = React.useMemo(
        () => [
            columnHelper.accessor(valueProp, {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
            columnHelper.accessor('fullName', {
                header: t('name'),
                cell: ({ getValue }) => getValue(),
                meta: {
                    style: {
                        textAlign: 'center',
                    },
                },
            }),
        ],
        [t, valueProp],
    );

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex flex-row space-x-4">{title && <h3 className="text-lg font-semibold">{title}</h3>}</div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <DataTable data={data} columns={columns} rowSelection={employees} onRowSelectionChange={setEmployees} />
        </div>
    );
};

MultipleEmployeesSelect.displayName = 'MultipleEmployeesSelect';
