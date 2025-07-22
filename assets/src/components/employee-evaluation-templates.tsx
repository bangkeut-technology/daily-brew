import React from 'react';
import { Employee } from '@/types/employee';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { EvaluationTemplateCriterias } from '@/components/evaluation-template-criterias';

interface EmployeeEvaluationTemplatesProps {
    employee: Employee;
    onSuccess?: () => void;
}

export const EmployeeEvaluationTemplates: React.FunctionComponent<EmployeeEvaluationTemplatesProps> = ({
    employee,
    onSuccess,
}) => {
    const renderItems = () => {
        return employee.templates?.map((template) => (
            <AccordionItem key={template.identifier} value={template.identifier}>
                <AccordionTrigger>{template.name}</AccordionTrigger>
                <AccordionContent>
                    <EvaluationTemplateCriterias employee={employee} template={template} onSuccess={onSuccess} />
                </AccordionContent>
            </AccordionItem>
        ));
    };

    return (
        <div className="w-full h-full">
            <Accordion type="multiple" defaultValue={employee.templates?.map((template) => template.identifier)}>
                {renderItems()}
            </Accordion>
        </div>
    );
};
