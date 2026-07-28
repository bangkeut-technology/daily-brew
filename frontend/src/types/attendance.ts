/**
 * 'voided' = a manager soft-deleted the row; still in DB for audit but
 *   excluded from stats and rendered as a tombstone in the log.
 * 'off' = the employee's shift has per-day rules and today isn't in the
 *   schedule (e.g. Mon-Fri GM on Saturday).
 */
export type AttendanceStatus = "present" | "absent" | "on_leave" | "voided" | "off";

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
  voidedAt?: string | null;
  voidedByEmail?: string | null;
  voidReason?: string | null;
}

/**
 * One cell of the Monthly grid: every calendar day in the range resolves to
 * exactly one status. Unlike {@link AttendanceRecord} this is derived — 'absent',
 * 'closure', 'upcoming' and 'off' days have no underlying row.
 */
export interface AttendanceDayStatus {
  date: string;
  status: "present" | "absent" | "leave" | "closure" | "upcoming" | "off" | "voided";
  attendancePublicId?: string;
  /** Workspace-local HH:MM, already formatted by the API. */
  checkInAt?: string | null;
  checkOutAt?: string | null;
  isLate?: boolean;
  leftEarly?: boolean;
  leaveType?: "paid" | "unpaid";
  editedAt?: string | null;
  editedByEmail?: string | null;
  editReason?: string | null;
  originalCheckInAt?: string | null;
  originalCheckOutAt?: string | null;
  voidedByEmail?: string | null;
  voidReason?: string | null;
}

export interface AttendanceSummaryEmployee {
  employeePublicId: string;
  employeeName: string;
  shiftName: string | null;
  days: AttendanceDayStatus[];
}
