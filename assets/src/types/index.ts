export interface User {
  publicId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  locale: string;
  onboardingCompleted: boolean;
  isSuperAdmin?: boolean;
}

export interface AdminDashboardData {
  totals: {
    users: number;
    workspaces: number;
    employees: number;
    attendances: number;
    subscriptions: number;
  };
  byPlan: Record<'free' | 'espresso' | 'double_espresso', number>;
  byStatus: Record<'active' | 'trialing' | 'past_due' | 'paused' | 'canceled', number>;
  growth: {
    usersLast7d: number;
    usersLast30d: number;
    workspacesLast7d: number;
    workspacesLast30d: number;
    employeesLast7d: number;
    employeesLast30d: number;
    attendancesLast7d: number;
    attendancesLast30d: number;
  };
  growthSeries: {
    date: string;
    users: number;
    workspaces: number;
    employees: number;
    attendances: number;
  }[];
  recentSignups: { publicId: string; email: string; fullName: string; createdAt: string }[];
  recentWorkspaces: {
    publicId: string;
    name: string;
    owner: { publicId: string; email: string } | null;
    createdAt: string;
  }[];
  recentActivity: {
    publicId: string;
    action: string;
    actionLabel: string;
    actorEmail: string | null;
    targetType: string;
    targetPublicId: string | null;
    targetLabel: string | null;
    createdAt: string;
  }[];
}

export interface AdminPagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminWorkspaceRow {
  publicId: string;
  name: string;
  owner: { publicId: string; email: string; fullName: string } | null;
  plan: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  isTrialing: boolean;
  employeeCount: number;
  createdAt: string;
  deletedAt: string | null;
}

export interface AdminWorkspaceDetail {
  publicId: string;
  name: string;
  qrToken: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  owner: { publicId: string; email: string; fullName: string } | null;
  employeeCount: number;
  qrCodeCount: number;
  subscription: {
    plan: string;
    status: string;
    paddleSubscriptionId: string | null;
    paddleCustomerId: string | null;
    currentPeriodEnd: string | null;
    trialEndsAt: string | null;
    canceledAt: string | null;
    isActive: boolean;
  } | null;
  settings: {
    timezone: string;
    ipRestrictionEnabled: boolean;
    geofencingEnabled: boolean;
    deviceVerificationEnabled: boolean;
  } | null;
}

export interface AdminUserRow {
  publicId: string;
  email: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  isSuperAdmin: boolean;
  hasGoogle: boolean;
  hasApple: boolean;
  hasPassword: boolean;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserRow {
  locale: string | null;
  onboardingCompleted: boolean;
  updatedAt: string;
  ownedWorkspaces: { publicId: string; name: string; deletedAt: string | null }[];
  linkedWorkspaces: {
    employeePublicId: string;
    employeeName: string;
    workspacePublicId: string | null;
    workspaceName: string | null;
    role: string;
  }[];
}

export interface AdminAuditLogRow {
  publicId: string;
  action: string;
  actionLabel: string;
  actor: { publicId: string; email: string } | null;
  actorEmail: string | null;
  targetType: string;
  targetPublicId: string | null;
  targetLabel: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminSubscriptionRow {
  publicId: string;
  plan: string;
  status: string;
  isActive: boolean;
  isTrialing: boolean;
  trialDaysRemaining: number | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  canceledAt: string | null;
  paddleSubscriptionId: string | null;
  workspace: { publicId: string; name: string };
  owner: { publicId: string; email: string } | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Workspace {
  publicId: string;
  name: string;
  qrToken: string;
  createdAt?: string;
}

export interface WorkspaceSetting {
  ipRestrictionEnabled: boolean;
  allowedIps: string[] | null;
  deviceVerificationEnabled: boolean;
  timezone: string;
  dateFormat: string;
  geofencingEnabled: boolean;
  geofencingLatitude: number | null;
  geofencingLongitude: number | null;
  geofencingRadiusMeters: number | null;
  telegramNotificationsEnabled: boolean;
  telegramChatId: string | null;
}

export interface ShiftTimeRule {
  publicId: string;
  dayOfWeek: number;
  dayOfWeekLabel: string;
  startTime: string;
  endTime: string;
}

export interface Shift {
  publicId: string;
  name: string;
  startTime: string;
  endTime: string;
  graceLateMinutes: number;
  graceEarlyMinutes: number;
  timeRules: ShiftTimeRule[];
}

export interface ClosurePeriod {
  publicId: string;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export type ManagerPermission =
  | 'manage_employees'
  | 'manage_shifts'
  | 'manage_closures'
  | 'manage_leave'
  | 'manage_attendance';

export const MANAGER_PERMISSIONS: ManagerPermission[] = [
  'manage_employees',
  'manage_shifts',
  'manage_closures',
  'manage_leave',
  'manage_attendance',
];

/**
 * How an employee is treated by the attendance system. `full` (default) — counted
 * in the dashboard absent calc, late/leftEarly flags fire when a shift is assigned.
 * `none` — excluded from the absent calc and never flagged late/early; the employee
 * CAN still check in (their times are recorded), but they're not penalised for
 * skipping. Used for admin helpers and flexible-hours staff.
 */
export type EmployeeAttendanceTracking = 'full' | 'none';

export interface Employee {
  publicId: string;
  firstName: string;
  lastName: string;
  name: string;
  /** Free-text job title (Cashier, Cook, Waiter, etc.) — display only, not used by backend logic. */
  jobTitle: string | null;
  username: string | null;
  phoneNumber: string | null;
  active: boolean;
  role: 'employee' | 'manager';
  shiftName: string | null;
  shiftPublicId: string | null;
  dob: string | null;
  joinedAt: string | null;
  linkedUserPublicId: string | null;
  linkedUserEmail: string | null;
  createdAt: string;
  managerPermissions: ManagerPermission[];
  attendanceTracking: EmployeeAttendanceTracking;
  attendance?: AttendanceRecord[];
}

export type AttendanceStatus = 'present' | 'absent' | 'on_leave';

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
}

export interface AttendanceDayStatus {
  date: string;
  status: 'present' | 'absent' | 'leave' | 'closure' | 'upcoming';
  checkInAt?: string | null;
  checkOutAt?: string | null;
  isLate?: boolean;
  leftEarly?: boolean;
  leaveType?: 'paid' | 'unpaid';
}

export interface AttendanceSummaryEmployee {
  employeePublicId: string;
  employeeName: string;
  shiftName: string | null;
  days: AttendanceDayStatus[];
}

export interface LeaveRequest {
  publicId: string;
  employeePublicId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  isFullDay: boolean;
  type: 'paid' | 'unpaid';
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalEmployees: number;
  present: number;
  late: number;
  onLeave: number;
  absent: number;
  pendingLeaves: number;
  recentAttendance: {
    publicId: string;
    employeeName: string;
    shiftName: string | null;
    checkInAt: string | null;
    checkOutAt: string | null;
    isLate: boolean;
    leftEarly: boolean;
  }[];
}

export interface CheckinStatus {
  employeeName: string;
  shiftName: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  today: {
    checkedIn: boolean;
    checkedOut: boolean;
    checkInAt: string | null;
    checkOutAt: string | null;
    isLate: boolean;
  };
}

export interface CheckinResponse {
  checkInAt: string | null;
  checkOutAt: string | null;
  isLate: boolean;
  leftEarly: boolean;
}

export interface PlanDetails {
  plan: 'free' | 'espresso' | 'double_espresso';
  planLabel: string;
  isEspresso: boolean;
  isDoubleEspresso: boolean;
  isTrialing: boolean;
  trialDaysRemaining: number | null;
  trialEndsAt: string | null;
  employeeLimit: number | null;
  remainingEmployeeSlots: number | null;
  canUseIpRestriction: boolean;
  canUseGeofencing: boolean;
  canUseLeaveRequests: boolean;
  canUseShiftTimeRules: boolean;
  canUseDeviceVerification: boolean;
  canUseManagers: boolean;
  canUseTelegramNotifications: boolean;
  canUseSubQrCodes: boolean;
  managerLimit: number | null;
  managerCount: number;
  currentPeriodEnd: string | null;
  status: string;
  paddleSubscriptionId: string | null;
}

export interface WorkspaceQrCodeRef {
  publicId: string;
  name: string;
}

export interface WorkspaceQrCode {
  publicId: string;
  qrToken: string;
  name: string;
  manager: { publicId: string; name: string } | null;
  assignedEmployees: { publicId: string; name: string }[];
  inheritIpSettings: boolean;
  ipRestrictionEnabled: boolean;
  allowedIps: string[] | null;
  inheritGeofencing: boolean;
  geofencingEnabled: boolean;
  geofencingLatitude: number | null;
  geofencingLongitude: number | null;
  geofencingRadiusMeters: number | null;
  inheritDeviceVerification: boolean;
  deviceVerificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceQrCodeInput {
  name?: string;
  managerPublicId?: string | null;
  assignedEmployeePublicIds?: string[];
  inheritIpSettings?: boolean;
  ipRestrictionEnabled?: boolean;
  allowedIps?: string[] | null;
  inheritGeofencing?: boolean;
  geofencingEnabled?: boolean;
  geofencingLatitude?: number | null;
  geofencingLongitude?: number | null;
  geofencingRadiusMeters?: number | null;
  inheritDeviceVerification?: boolean;
  deviceVerificationEnabled?: boolean;
}

export interface RoleContext {
  isOwner: boolean;
  isEmployee: boolean;
  isManager: boolean;
  managerPermissions: ManagerPermission[];
  onboardingCompleted: boolean;
  ownedWorkspaces: { publicId: string; name: string }[];
  employee: {
    publicId: string;
    name: string;
    workspacePublicId: string | null;
    workspaceName: string | null;
  } | null;
  linkedWorkspaces: {
    workspacePublicId: string | null;
    workspaceName: string | null;
    employeePublicId: string;
    employeeName: string;
    role: EmployeeRole;
  }[];
}

export type EmployeeRole = 'employee' | 'manager';
