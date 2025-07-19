import { apiAxios } from '@/lib/apiAxios';
import { EmployeeEvaluation, PartialEmployeeEvaluation } from '@/types/employee-evaluation';

export const postEmployeeEvaluation = async ({
    identifier,
    data,
}: {
    identifier: string;
    data: PartialEmployeeEvaluation;
}) => {
    return apiAxios
        .post<{
            message: string;
            evaluation: EmployeeEvaluation;
        }>(`/employees/${identifier}/evaluations`, {
            template: data.template,
            note: data.note,
            scores: data.scores.map((score) => ({
                score: score.score,
                criteria: score.criteria,
                comment: score.comment,
            })),
        })
        .then((response) => response.data);
};
