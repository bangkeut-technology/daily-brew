import { User } from '@/types/user';
import { AttendanceType, AttendanceTypeEnum } from '@/types/attendance';

export type AttendanceBatch = {
    id: number;
    publicId: number;
    label: string;
    canonicalLabel: string;
    fromDate: string;
    toDate: string;
    type: AttendanceTypeEnum;
    note?: string;
    user: User;
};

export type PartialAttendanceBatch = Omit<
    AttendanceBatch,
    'id' | 'publicId' | 'user' | 'canonicalLabel' | 'fromDate' | 'toDate'
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
