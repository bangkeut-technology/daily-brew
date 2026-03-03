import { apiAxios } from '@/lib/apiAxios';
import { PartialPayslipItem, Payslip, PayrollRun } from '@/types/payroll';

export const fetchPayrollRuns = (workspacePublicId: string) =>
    apiAxios.get<PayrollRun[]>(`/workspaces/${workspacePublicId}/payroll`).then((response) => response.data);

export const createPayrollRun = ({ workspacePublicId, period }: { workspacePublicId: string; period: string }) =>
    apiAxios.post<PayrollRun>(`/workspaces/${workspacePublicId}/payroll`, { period }).then((response) => response.data);

export const fetchPayrollRun = ({
    workspacePublicId,
    runPublicId,
}: {
    workspacePublicId: string;
    runPublicId: string;
}) =>
    apiAxios
        .get<PayrollRun>(`/workspaces/${workspacePublicId}/payroll/${runPublicId}`)
        .then((response) => response.data);

export const finalizePayrollRun = ({
    workspacePublicId,
    runPublicId,
}: {
    workspacePublicId: string;
    runPublicId: string;
}) =>
    apiAxios
        .post<{ message: string }>(`/workspaces/${workspacePublicId}/payroll/${runPublicId}/finalize`)
        .then((response) => response.data);

export const deletePayrollRun = ({
    workspacePublicId,
    runPublicId,
}: {
    workspacePublicId: string;
    runPublicId: string;
}) =>
    apiAxios
        .delete<{ message: string }>(`/workspaces/${workspacePublicId}/payroll/${runPublicId}`)
        .then((response) => response.data);

export const addPayslipItem = ({
    workspacePublicId,
    runPublicId,
    slipPublicId,
    data,
}: {
    workspacePublicId: string;
    runPublicId: string;
    slipPublicId: string;
    data: PartialPayslipItem;
}) =>
    apiAxios
        .post<Payslip>(`/workspaces/${workspacePublicId}/payroll/${runPublicId}/payslips/${slipPublicId}/items`, data)
        .then((response) => response.data);

export const deletePayslipItem = ({
    workspacePublicId,
    runPublicId,
    slipPublicId,
    itemPublicId,
}: {
    workspacePublicId: string;
    runPublicId: string;
    slipPublicId: string;
    itemPublicId: string;
}) =>
    apiAxios
        .delete<{
            message: string;
        }>(`/workspaces/${workspacePublicId}/payroll/${runPublicId}/payslips/${slipPublicId}/items/${itemPublicId}`)
        .then((response) => response.data);

export const payPayslip = ({
    workspacePublicId,
    runPublicId,
    slipPublicId,
}: {
    workspacePublicId: string;
    runPublicId: string;
    slipPublicId: string;
}) =>
    apiAxios
        .post<Payslip>(`/workspaces/${workspacePublicId}/payroll/${runPublicId}/payslips/${slipPublicId}/pay`)
        .then((response) => response.data);
