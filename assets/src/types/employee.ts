import { Role } from '@/types/role';

export type Employee = {
    id: number;
    identifier: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    dob?: string;
    joinedAt?: string;
    status: EmployeeStatus;
    roles: Role[];
};

export type PartialEmployee = Omit<Employee, 'id' | 'identifier' | 'dob' | 'joinedAt' | 'roles' | 'status'> & {
    dob?: Date;
    joinedAt?: Date;
    roles?: Array<{ value: number }>;
};

export type EmployeeStatus = 'active' | 'on_leave' | 'suspended' | 'resigned' | 'probation';
