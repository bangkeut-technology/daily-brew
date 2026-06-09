/**
 * 'voided' = a manager soft-deleted the row; still in DB for audit but
 *   excluded from stats and rendered as a tombstone in the log.
 * 'off' = the employee's shift has per-day rules and today isn't in the
 *   schedule (e.g. Mon-Fri GM on Saturday). Forward-prep for when the
 *   gantt/summary views land in Next — the simple single-day list view
 *   today only renders actual records and never emits this.
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
