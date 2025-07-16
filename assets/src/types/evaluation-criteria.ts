export type EvaluationCriteria = {
    id: number;
    identifier: string;
    label: string;
    description?: string;
    weight: number;
};

export type PartialEvaluationCriteria = Omit<EvaluationCriteria, 'id' | 'identifier'>;
