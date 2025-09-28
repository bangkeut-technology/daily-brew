import { User } from '@/types/user';
import { AttendanceType, AttendanceTypeEnum } from '@/types/attendance';
import { Employee } from '@/types/employee';

export type AttendanceBatch = {
    id: number;
    publicId: string;
    label: string;
    createdAt: string;
    updatedAt: string;
    canonicalLabel: string;
    fromDate: string;
    toDate: string;
    type: AttendanceTypeEnum;
    note?: string;
    user: User;
    employees?: Employee[];
};

export type PartialAttendanceBatch = Omit<
    AttendanceBatch,
    'id' | 'publicId' | 'user' | 'canonicalLabel' | 'fromDate' | 'toDate' | 'employees' | 'createdAt' | 'updatedAt'
> & {
    fromDate: Date;
    toDate: Date;
    employees?: Array<{ value: number }>;
};

export type AttendanceBatchSearchParams = {
    from: string | undefined;
    to: string | undefined;
    name?: string;
    type?: AttendanceType;
};
