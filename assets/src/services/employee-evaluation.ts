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
        }>(`/employees/${identifier}/evaluations`, data)
        .then((response) => response.data);
};
