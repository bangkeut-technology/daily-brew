import { apiAxios } from '@/lib/apiAxios';
import { EmployeeEvaluation, PartialEmployeeEvaluation } from '@/types/employee-evaluation';

export const postEmployeeEvaluation = async ({
    publicId,
    data,
}: {
    publicId: string;
    data: PartialEmployeeEvaluation;
}) => {
    return apiAxios
        .post<{
            message: string;
            evaluation: EmployeeEvaluation;
        }>(`/employees/${publicId}/evaluations`, {
            template: data.template,
            note: data.note,
            evaluatedAt: data.evaluatedAt,
            scores: data.scores.map((score) => ({
                score: score.score,
                criteria: score.criteria,
                comment: score.comment,
            })),
        })
        .then((response) => response.data);
};
