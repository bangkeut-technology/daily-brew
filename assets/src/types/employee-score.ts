import { EvaluationTemplateCriteria } from '@/types/evaluation-template-criterias';

export type EmployeeScore = {
    id: number;
    comment?: string;
    score: number;
    criteriaLabel: string;
    weight: number;
    criteria: EvaluationTemplateCriteria;
};

export type PartialEmployeeScore = Omit<EmployeeScore, 'id' | 'criteria' | 'score'> & {
    criteria: number;
    score: string;
};
