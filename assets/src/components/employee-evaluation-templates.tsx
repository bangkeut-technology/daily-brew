import React from 'react';
import { Employee } from '@/types/employee';

interface EmployeeEvaluationTemplatesProps {
    employee: Employee;
}

export const EmployeeEvaluationTemplates: React.FunctionComponent<EmployeeEvaluationTemplatesProps> = ({
    employee,
}) => {
    return (
        <div className="w-full h-full">
            <h1 className="text-2xl font-bold">Employee Evaluation Templates</h1>
            <p>
                Here you can manage evaluation templates for {employee.firstName} {employee.lastName}.
            </p>
            {/* Additional UI components for managing evaluation templates can be added here */}
        </div>
    );
};
