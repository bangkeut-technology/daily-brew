import type { ManagerPermission } from "@/types/auth";
import type { AttendanceRecord } from "@/types/attendance";

export type EmployeeAttendanceTracking = "full" | "none";
export type EmployeeRole = "employee" | "manager";

/** Render order for the manager-permission editor. */
export const MANAGER_PERMISSIONS: ManagerPermission[] = [
  "manage_employees",
  "manage_shifts",
  "manage_closures",
  "manage_leave",
  "manage_attendance",
];

export interface Employee {
  publicId: string;
  firstName: string;
  lastName: string;
  name: string;
  jobTitle: string | null;
  username: string | null;
  phoneNumber: string | null;
  active: boolean;
  role: EmployeeRole;
  shiftName: string | null;
  shiftPublicId: string | null;
  dob: string | null;
  joinedAt: string | null;
  /**
   * Absent-baseline anchor — first date the employee can be counted absent.
   * Stamped on linkUser; editable by the owner to correct historical data.
   */
  linkedAt: string | null;
  /** Last day worked — set when the employee is deactivated. */
  leftAt: string | null;
  linkedUserPublicId: string | null;
  linkedUserEmail: string | null;
  createdAt: string;
  managerPermissions: ManagerPermission[];
  attendanceTracking: EmployeeAttendanceTracking;
  photoUrl?: string | null;
  /** Last 30 records — only present on the single-employee endpoint. */
  attendance?: AttendanceRecord[];
}
