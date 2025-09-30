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
    defaultValue?: Employee[];
    name: string;
    title?: string;
    description?: string;
}

export const MultipleEmployeesSelect: React.FunctionComponent<MultipleEmployeesSelectProps> = ({
    control,
    valueProp = 'publicId',
    defaultValue = [],
    name,
    title,
    description,
}) => {
    const { t } = useTranslation();
    const { replace } = useFieldArray({
        name,
        control,
    });
    const { data: employees = [], isSuccess } = useQuery({
        queryKey,
        queryFn: () => fetchEmployees({ from: new Date(), to: new Date() }),
    });
    const [selectedEmployees, setSelectedEmployees] = React.useState<RowSelectionState>({});

    React.useEffect(() => {
        if (isSuccess && employees.length > 0) {
            setSelectedEmployees(() =>
                defaultValue.reduce<RowSelectionState>((accumulator, selected) => {
                    const foundIndex = employees.findIndex((employee) => employee.id === selected.id);
                    if (foundIndex !== -1) {
                        accumulator[foundIndex] = true;
                    }
                    return accumulator;
                }, {}),
            );
        }
    }, [isSuccess, employees, defaultValue]);

    React.useEffect(() => {
        const selectedRows = Object.keys(selectedEmployees).map((value) => employees[Number(value)]);
        replace(selectedRows.map((employee) => ({ value: employee.id })));
    }, [employees, replace, selectedEmployees]);

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
            <DataTable
                data={employees}
                columns={columns}
                rowSelection={selectedEmployees}
                onRowSelectionChange={setSelectedEmployees}
                valueProps={valueProp}
            />
        </div>
    );
};

MultipleEmployeesSelect.displayName = 'MultipleEmployeesSelect';
