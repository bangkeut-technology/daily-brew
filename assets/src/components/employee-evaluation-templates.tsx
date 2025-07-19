import React from 'react';
import { Employee } from '@/types/employee';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { EvaluationTemplateCriterias } from '@/components/evaluation-template-criterias';

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
                <AccordionContent>
                    <EvaluationTemplateCriterias employee={employee} template={template} />
                </AccordionContent>
            </AccordionItem>
        ));
    };

    return (
        <div className="w-full h-full">
            <Accordion type="multiple">{renderItems()}</Accordion>
        </div>
    );
};
