import { Employee } from '@/types/employee';
import { User } from '@/types/user';

export type Attendance = {
    id: number;
    publicId: string;
    attendanceDate: string;
    note?: string;
    type: AttendanceType;
    clockIn?: string;
    clockOut?: string;
    employee: Employee;
    user: User;
};

export type PartialAttendance = Omit<
    Attendance,
    'id' | 'publicId' | 'employee' | 'user' | 'clockIn' | 'clockOut' | 'attendanceDate'
> & {
    employee?: string;
    attendanceDate: Date;
    clockIn?: Date;
    clockOut?: Date;
};

export type AttendanceType = keyof typeof AttendanceTypeEnum;

export enum AttendanceTypeEnum {
    present = 'present',
    absent = 'absent',
    leave = 'leave',
    late = 'late',
    sick = 'sick',
    holiday = 'holiday',
    remote = 'remote',
    unknown = 'unknown',
}

export type AttendanceSearchParams = {
    from: string | undefined;
    to: string | undefined;
    employee?: string;
    employees?: Employee[];
    type?: AttendanceType;
};
