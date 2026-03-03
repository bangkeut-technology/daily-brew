import { Employee } from '@/types/employee';
import { User } from '@/types/user';

export enum PayrollRunStatusEnum {
    DRAFT = 'draft',
    FINALIZED = 'finalized',
}

export enum PayslipStatusEnum {
    PENDING = 'pending',
    PAID = 'paid',
}

export enum PayslipItemTypeEnum {
    BONUS = 'bonus',
    ALLOWANCE = 'allowance',
    DEDUCTION = 'deduction',
}

export type PayslipItem = {
    id: number;
    publicId: string;
    type: PayslipItemTypeEnum;
    label: string;
    amount: string;
    createdAt: string;
    updatedAt: string;
};

export type Payslip = {
    id: number;
    publicId: string;
    employee: Employee;
    baseSalary: string;
    totalAllowances: string;
    totalDeductions: string;
    netPay: string;
    currency: string;
    workingDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;
    status: PayslipStatusEnum;
    paidAt?: string;
    notes?: string;
    items: PayslipItem[];
    createdAt: string;
    updatedAt: string;
};

export type PayrollRun = {
    id: number;
    publicId: string;
    period: string;
    status: PayrollRunStatusEnum;
    processedAt?: string;
    processedBy?: User;
    payslips?: Payslip[];
    createdAt: string;
    updatedAt: string;
};

export type PartialPayslipItem = {
    type: PayslipItemTypeEnum;
    label: string;
    amount: string;
};
