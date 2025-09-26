import { apiAxios } from '@/lib/apiAxios';
import { EmployeeEvaluation, PartialEmployeeEvaluation } from '@/types/employee-evaluation';
import { HistoriesSearchParams } from '@/routes/console/_authenticated/_layout/evaluations/histories/-components/history-search-form';
import { Employee } from '@/types/employee';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@/constants/date';

export const fetchEmployeeEvaluations = async (params: HistoriesSearchParams) =>
    apiAxios.get<EmployeeEvaluation[]>('/employee-evaluations', { params }).then((response) => response.data);

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
            evaluatedAt: data.evaluatedAt && format(data.evaluatedAt, DATE_FORMAT),
            scores: data.scores.map((score) => ({
                score: score.score,
                criteria: score.criteria,
                comment: score.comment,
            })),
        })
        .then((response) => response.data);
};

export const putEmployeeEvaluation = async ({
    publicId,
    data,
}: {
    publicId: string;
    data: PartialEmployeeEvaluation;
}) => {
    return apiAxios
        .put<{
            message: string;
            evaluation: EmployeeEvaluation;
        }>(`/employee-evaluations/${publicId}`, {
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

export const fetchGanttEmployeeEvaluations = async ({
    employees,
    ...params
}: {
    from: string;
    to: string;
    employees: Employee[];
}) =>
    apiAxios
        .get<{
            [employeePublicId: string]: { [evaluatedAt: string]: EmployeeEvaluation };
        }>('/employee-evaluations/gantt', {
            params: { ...params, employees: employees?.map((employee) => employee.publicId) },
        })
        .then((response) => response.data);

export const fetchRecentEvaluations = async (limit = 10) =>
    apiAxios
        .get<EmployeeEvaluation[]>('/employee-evaluations/recents', { params: { limit } })
        .then((response) => response.data);
