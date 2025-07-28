import { apiAxios } from '@/lib/apiAxios';

export const deleteTemplateCriteria = async (publicId: string) => {
    return await apiAxios
        .delete<{ message: string }>(`/evaluation-template-criterias/${publicId}`)
        .then((response) => response.data);
};
