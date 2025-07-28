import { EvaluationTemplate, PartialEvaluationTemplate } from '@/types/evaluation-template';
import { apiAxios } from '@/lib/apiAxios';
import { EvaluationTemplateCriteria } from '@/types/evaluation-template-criterias';
import { Employee } from '@/types/employee';

export const fetchEvaluationTemplates = async () => {
    const response = await apiAxios.get<EvaluationTemplate[]>(`/evaluation-templates`);
    return response.data;
};
export const postEvaluationTemplate = async ({ criterias = [], ...data }: PartialEvaluationTemplate) => {
    return await apiAxios
        .post<{
            template: EvaluationTemplate;
            message: string;
        }>('/evaluation-templates', { ...data, criterias: criterias.map((criteria) => criteria.value) })
        .then((response) => response.data);
};
export const fetchEvaluationTemplate = async (publicId: string) => {
    return await apiAxios
        .get<EvaluationTemplate>(`/evaluation-templates/${publicId}`)
        .then((response) => response.data);
};

export const putEvaluationTemplate = async ({
    publicId,
    data,
}: {
    publicId: string;
    data: PartialEvaluationTemplate;
}) => {
    return await apiAxios
        .put<{ template: EvaluationTemplate; message: string }>(`/evaluation-templates/${publicId}`, data)
        .then((response) => response.data);
};

export const deleteEvaluationTemplate = async (publicId: string) => {
    return await apiAxios
        .delete<{ message: string }>(`/evaluation-templates/${publicId}`)
        .then((response) => response.data);
};

export const patchEvaluationTemplate = async (publicId: string) => {
    return await apiAxios
        .patch<{ template: EvaluationTemplate; message: string }>(`/evaluation-templates/${publicId}`)
        .then((response) => response.data);
};

export const fetchTemplateCriterias = async (publicId: string) => {
    return await apiAxios
        .get<EvaluationTemplateCriteria[]>(`/evaluation-templates/${publicId}/criterias`)
        .then((response) => response.data);
};

export const postTemplateCriterias = async ({ publicId, criterias }: { publicId: string; criterias: number[] }) => {
    return await apiAxios
        .post<{ message: string }>(`/evaluation-templates/${publicId}/criterias`, { criterias })
        .then((response) => response.data);
};

export const fetchTemplateEmployees = async (publicId: string) => {
    return await apiAxios
        .get<Employee[]>(`/evaluation-templates/${publicId}/employees`)
        .then((response) => response.data);
};

export const postTemplateEmployees = async ({ publicId, employees }: { publicId: string; employees: number[] }) => {
    return await apiAxios
        .post<{ message: string }>(`/evaluation-templates/${publicId}/employees`, { employees })
        .then((response) => response.data);
};

export const deleteTemplateEmployees = async ({
    publicId,
    employeePublicId,
}: {
    publicId: string;
    employeePublicId: string;
}) => {
    return await apiAxios
        .delete<{ message: string }>(`/evaluation-templates/${publicId}/employees/${employeePublicId}`)
        .then((response) => response.data);
};
