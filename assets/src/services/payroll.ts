import { apiAxios } from '@/lib/apiAxios';
import { PartialPayslipItem, Payslip, PayrollRun } from '@/types/payroll';

export const fetchPayrollRuns = (workspacePublicId: string) =>
    apiAxios.get<PayrollRun[]>(`/workspaces/${workspacePublicId}/payroll`).then((response) => response.data);

export const createPayrollRun = ({ workspacePublicId, period }: { workspacePublicId: string; period: string }) =>
    apiAxios.post<PayrollRun>(`/workspaces/${workspacePublicId}/payroll`, { period }).then((response) => response.data);

export const fetchPayrollRun = ({ workspacePublicId, publicId }: { workspacePublicId: string; publicId: string }) =>
    apiAxios.get<PayrollRun>(`/workspaces/${workspacePublicId}/payroll/${publicId}`).then((response) => response.data);

export const finalizePayrollRun = ({
    workspacePublicId,
    publicId,
}: {
    workspacePublicId: string;
    publicId: string;
}) =>
    apiAxios
        .post<{ message: string }>(`/workspaces/${workspacePublicId}/payroll/${publicId}/finalize`)
        .then((response) => response.data);

export const deletePayrollRun = ({
    workspacePublicId,
    publicId,
}: {
    workspacePublicId: string;
    publicId: string;
}) =>
    apiAxios
        .delete<{ message: string }>(`/workspaces/${workspacePublicId}/payroll/${publicId}`)
        .then((response) => response.data);

export const addPayslipItem = ({
    workspacePublicId,
    publicId,
    slipPublicId,
    data,
}: {
    workspacePublicId: string;
    publicId: string;
    slipPublicId: string;
    data: PartialPayslipItem;
}) =>
    apiAxios
        .post<Payslip>(`/workspaces/${workspacePublicId}/payroll/${publicId}/payslips/${slipPublicId}/items`, data)
        .then((response) => response.data);

export const deletePayslipItem = ({
    workspacePublicId,
    publicId,
    slipPublicId,
    itemPublicId,
}: {
    workspacePublicId: string;
    publicId: string;
    slipPublicId: string;
    itemPublicId: string;
}) =>
    apiAxios
        .delete<{
            message: string;
        }>(`/workspaces/${workspacePublicId}/payroll/${publicId}/payslips/${slipPublicId}/items/${itemPublicId}`)
        .then((response) => response.data);

export const payPayslip = ({
    workspacePublicId,
    publicId,
    slipPublicId,
}: {
    workspacePublicId: string;
    publicId: string;
    slipPublicId: string;
}) =>
    apiAxios
        .post<Payslip>(`/workspaces/${workspacePublicId}/payroll/${publicId}/payslips/${slipPublicId}/pay`)
        .then((response) => response.data);
