import React from 'react';
import { Employee } from '@/types/employee';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { EvaluationTemplateCriterias } from '@/components/evaluation-template-criterias';
import { useTranslation } from 'react-i18next';

interface EmployeeEvaluationTemplatesProps {
    employee: Employee;
    evaluatedAt?: Date;
    onSuccess?: () => void;
}

export const EmployeeEvaluationTemplates: React.FunctionComponent<EmployeeEvaluationTemplatesProps> = ({
    employee,
    evaluatedAt,
    onSuccess,
}) => {
    const { t } = useTranslation('glossary');

    const renderItems = React.useCallback(() => {
        return employee.templates?.map((template) => (
            <AccordionItem key={template.publicId} value={template.publicId}>
                <AccordionTrigger>{template.name}</AccordionTrigger>
                <AccordionContent>
                    <EvaluationTemplateCriterias
                        evaluatedAt={evaluatedAt}
                        employee={employee}
                        template={template}
                        onSuccess={onSuccess}
                    />
                </AccordionContent>
            </AccordionItem>
        ));
    }, [employee, evaluatedAt, onSuccess]);

    if (employee.templates?.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <h4 className="text-lg font-semibold text-gray-500">{t('employees.templates.no_linked')}</h4>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <Accordion type="multiple" defaultValue={employee.templates?.map((template) => template.publicId)}>
                {renderItems()}
            </Accordion>
        </div>
    );
};

EmployeeEvaluationTemplates.displayName = 'EmployeeEvaluationTemplates';
