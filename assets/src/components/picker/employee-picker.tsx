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

const queryKey = ['daily-brew-employees'];

interface EmployeeSelectProps {
    name: string;
    title?: string;
    description?: string;
}

export const EmployeeSelect: React.FunctionComponent<EmployeeSelectProps> = ({ title, description }) => {
    const [employees, setEmployees] = React.useState<RowSelectionState>({});
    const { t } = useTranslation();
    const { data = [] } = useQuery({
        queryKey,
        queryFn: () => fetchEmployees({ from: new Date().toISOString(), to: new Date().toISOString() }),
    });

    return (
        <div className="flex flex-col space-y-4">
            <div className="flex flex-row space-x-4">{title && <h3 className="text-lg font-semibold">{title}</h3>}</div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
            <DataTable data={data} columns={columns} rowSelection={employees} onRowSelectionChange={setEmployees} />
        </div>
    );
};

EmployeeSelect.displayName = 'EmployeeSelect';
