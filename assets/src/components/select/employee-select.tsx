import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEmployees } from '@/services/employee';
import { useTranslation } from 'react-i18next';
import { Control } from 'react-hook-form';
import { Employee } from '@/types/employee';
import { SelectField } from '@/components/field/select-field';

interface EmployeeSelectProps {
    control: Control<any>;
    valueProp?: keyof Employee;
    name: string;
    label?: string;
    description?: string;
}

export const EmployeeSelect: React.FunctionComponent<EmployeeSelectProps> = ({
    control,
    name,
    label,
    valueProp = 'publicId',
    description,
}) => {
    const { t } = useTranslation();
    const { data = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: () => fetchEmployees({ from: new Date(), to: new Date() }),
    });

    const placeholder = React.useMemo(() => t('placeholder.picker.employee', { ns: 'glossary' }), [t]);

    const options = React.useMemo(() => {
        return data.map((employee) => ({
            label: employee.fullName,
            value: employee[valueProp]?.toString() || 'undefined',
        }));
    }, [data, valueProp]);

    return (
        <div className="flex flex-col space-y-2">
            <SelectField
                control={control}
                name={name}
                options={options}
                label={label}
                description={description}
                placeholder={placeholder}
                className="w-full"
            />
        </div>
    );
};

EmployeeSelect.displayName = 'EmployeeSelect';
