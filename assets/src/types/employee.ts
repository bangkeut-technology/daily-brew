import { Role } from '@/types/role';
import { EvaluationTemplate } from '@/types/evaluation-template';

export type Employee = {
    id: number;
    identifier: string;
    firstName: string;
    lastName: string;
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
    'id' | 'identifier' | 'dob' | 'joinedAt' | 'roles' | 'status' | 'templates' | 'averageScore'
> & {
    dob?: Date;
    joinedAt?: Date;
    roles?: Array<{ value: number }>;
    template?: number;
};

export type EmployeeStatus = 'active' | 'on_leave' | 'suspended' | 'resigned' | 'probation';
