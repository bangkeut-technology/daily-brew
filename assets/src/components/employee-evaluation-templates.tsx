import React from 'react';
import { Employee } from '@/types/employee';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface EmployeeEvaluationTemplatesProps {
    employee: Employee;
}

export const EmployeeEvaluationTemplates: React.FunctionComponent<EmployeeEvaluationTemplatesProps> = ({
    employee,
}) => {
    const renderItems = () => {
        return employee.templates?.map((template) => (
            <AccordionItem key={template.identifier} value={template.identifier}>
                <AccordionTrigger>{template.name}</AccordionTrigger>
                <AccordionContent></AccordionContent>
            </AccordionItem>
        ));
    };

    return (
        <div className="w-full h-full">
            <h1 className="text-2xl font-bold">Employee Evaluation Templates</h1>
            <p>
                Here you can manage evaluation templates for {employee.firstName} {employee.lastName}.
            </p>
            <Accordion type="multiple">{renderItems()}</Accordion>
        </div>
    );
};
