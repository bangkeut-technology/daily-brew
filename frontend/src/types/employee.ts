import type { ManagerPermission } from "@/types/auth";

export type EmployeeAttendanceTracking = "full" | "none";
export type EmployeeRole = "employee" | "manager";

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
  /** Last day worked — set when the employee is deactivated. */
  leftAt: string | null;
  linkedUserPublicId: string | null;
  linkedUserEmail: string | null;
  createdAt: string;
  managerPermissions: ManagerPermission[];
  attendanceTracking: EmployeeAttendanceTracking;
}
