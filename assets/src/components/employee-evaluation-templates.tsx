import React from 'react';
import { Employee } from '@/types/employee';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { EvaluationTemplateCriterias } from '@/components/evaluation-template-criterias';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface EmployeeEvaluationTemplatesProps {
    employee: Employee;
}

export const EmployeeEvaluationTemplates: React.FunctionComponent<EmployeeEvaluationTemplatesProps> = ({
    employee,
}) => {
    const { t } = useTranslation();
    const renderItems = () => {
        return employee.templates?.map((template) => (
            <AccordionItem key={template.identifier} value={template.identifier}>
                <AccordionTrigger>{template.name}</AccordionTrigger>
                <AccordionContent>
                    <EvaluationTemplateCriterias template={template} />
                    <Button className="w-full mt-4">{t('employee_evaluations.new.save', { ns: 'glossary' })}</Button>
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
