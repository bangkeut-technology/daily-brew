export type AttendanceStatus = "present" | "absent" | "on_leave";

export interface AttendanceRecord {
  publicId: string;
  employeePublicId?: string;
  employeeName?: string;
  shiftName?: string | null;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  isLate: boolean;
  leftEarly: boolean;
  status?: AttendanceStatus;
  editedAt?: string | null;
  editedByEmail?: string | null;
  editReason?: string | null;
  originalCheckInAt?: string | null;
  originalCheckOutAt?: string | null;
}
