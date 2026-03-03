import { apiAxios } from '@/lib/apiAxios';
import { CreateShiftPayload, CreateTimeRulePayload, Shift } from '@/types/shift';

export const fetchShifts = (workspacePublicId: string) =>
    apiAxios.get<Shift[]>(`/workspaces/${workspacePublicId}/shifts`).then((r) => r.data);

export const createShift = ({ workspacePublicId, data }: { workspacePublicId: string; data: CreateShiftPayload }) =>
    apiAxios.post<Shift>(`/workspaces/${workspacePublicId}/shifts`, data).then((r) => r.data);

export const fetchShift = ({ workspacePublicId, publicId }: { workspacePublicId: string; publicId: string }) =>
    apiAxios.get<Shift>(`/workspaces/${workspacePublicId}/shifts/${publicId}`).then((r) => r.data);

export const updateShift = ({
    workspacePublicId,
    publicId,
    data,
}: {
    workspacePublicId: string;
    publicId: string;
    data: Partial<CreateShiftPayload>;
}) => apiAxios.put<Shift>(`/workspaces/${workspacePublicId}/shifts/${publicId}`, data).then((r) => r.data);

export const deleteShift = ({ workspacePublicId, publicId }: { workspacePublicId: string; publicId: string }) =>
    apiAxios.delete<{ message: string }>(`/workspaces/${workspacePublicId}/shifts/${publicId}`).then((r) => r.data);

export const addTimeRule = ({
    workspacePublicId,
    publicId,
    data,
}: {
    workspacePublicId: string;
    publicId: string;
    data: CreateTimeRulePayload;
}) => apiAxios.post<Shift>(`/workspaces/${workspacePublicId}/shifts/${publicId}/time-rules`, data).then((r) => r.data);

export const removeTimeRule = ({
    workspacePublicId,
    publicId,
    rulePublicId,
}: {
    workspacePublicId: string;
    publicId: string;
    rulePublicId: string;
}) =>
    apiAxios
        .delete<Shift>(`/workspaces/${workspacePublicId}/shifts/${publicId}/time-rules/${rulePublicId}`)
        .then((r) => r.data);

export const assignEmployee = ({
    workspacePublicId,
    publicId,
    employeePublicId,
}: {
    workspacePublicId: string;
    publicId: string;
    employeePublicId: string;
}) =>
    apiAxios
        .post<Shift>(`/workspaces/${workspacePublicId}/shifts/${publicId}/employees/${employeePublicId}`)
        .then((r) => r.data);

export const unassignEmployee = ({
    workspacePublicId,
    publicId,
    employeePublicId,
}: {
    workspacePublicId: string;
    publicId: string;
    employeePublicId: string;
}) =>
    apiAxios
        .delete<Shift>(`/workspaces/${workspacePublicId}/shifts/${publicId}/employees/${employeePublicId}`)
        .then((r) => r.data);
