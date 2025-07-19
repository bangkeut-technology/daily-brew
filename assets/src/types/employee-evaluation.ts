import { Employee } from '@/types/employee';
import { EvaluationTemplate } from '@/types/evaluation-template';
import { User } from '@/types/user';

export type EmployeeEvaluation = {
    id: number;
    identifier: string;
    note?: string;
    averageScore?: number;
    templateName: string;
    evaluatedAt: string;
    employee: Employee;
    evaluator: User;
    template?: EvaluationTemplate;
};

export type PartialEmployeeEvaluation = Omit<
    EmployeeEvaluation,
    'id' | 'identifier' | 'templateName' | 'evaluatedAt' | 'template' | 'employee' | 'evaluator'
> & {};
