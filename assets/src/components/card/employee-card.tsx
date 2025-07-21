import React from 'react';
import { Employee } from '@/types/employee';
import { useTranslation } from 'react-i18next';

interface EmployeeCardProps {
    employee: Employee;
    onClick?: (employee: Employee) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onClick }) => {
    const { t } = useTranslation('glossary');
    const handleClick = () => {
        if (onClick) {
            onClick(employee);
        }
    };
    return (
        <div className="p-4 border rounded-lg hover:bg-gray-100 cursor-pointer" onClick={handleClick}>
            <div>
                <h2 className="text-xl font-semibold">{`${employee.firstName} ${employee.lastName}`}</h2>
                <p className="text-gray-500">{employee.status}</p>
            </div>
            {
                <div className="flex flex-col mt-2 space-y-2">
                    <p className="text-gray-500">{t('employees.kpi_score')}</p>
                    <h1 className="text-2xl font-bold">{employee.averageScore}</h1>
                </div>
            }
        </div>
    );
};
