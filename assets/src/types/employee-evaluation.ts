import { Employee } from '@/types/employee';
import { EvaluationTemplate } from '@/types/evaluation-template';
import { User } from '@/types/user';
import { EmployeeScore, PartialEmployeeScore } from '@/types/EmployeeScore';

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
    scores: EmployeeScore[];
};

export type PartialEmployeeEvaluation = Omit<
    EmployeeEvaluation,
    | 'id'
    | 'identifier'
    | 'templateName'
    | 'evaluatedAt'
    | 'template'
    | 'employee'
    | 'evaluator'
    | 'scores'
    | 'averageScore'
> & {
    template: number;
    scores: PartialEmployeeScore[];
};
