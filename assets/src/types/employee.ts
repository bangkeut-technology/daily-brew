import { Role } from '@/types/role';
import { EvaluationTemplate } from '@/types/evaluation-template';

export type Employee = {
    id: number;
    publicId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phoneNumber?: string;
    dob?: string;
    joinedAt?: string;
    averageScore: number;
    status: EmployeeStatus;
    roles: Role[];
    templates?: EvaluationTemplate[];
};

export type PartialEmployee = Omit<
    Employee,
    'id' | 'publicId' | 'dob' | 'joinedAt' | 'roles' | 'status' | 'templates' | 'averageScore' | 'fullName'
> & {
    dob?: Date;
    joinedAt?: Date;
    roles?: Array<{ value: number }>;
    template?: number;
};

export type EmployeeStatus = keyof typeof EmployeeStatusEnum;

export enum EmployeeStatusEnum {
    active = 'active',
    on_leave = 'on_leave',
    suspended = 'suspended',
    resigned = 'resigned',
    probation = 'probation',
}
