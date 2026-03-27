export interface User {
  publicId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  locale: string;
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Workspace {
  publicId: string;
  name: string;
  createdAt?: string;
}

export interface WorkspaceSetting {
  ipRestrictionEnabled: boolean;
  allowedIps: string[] | null;
  timezone: string;
  locale: string;
  geofencingEnabled: boolean;
  geofencingLatitude: number | null;
  geofencingLongitude: number | null;
  geofencingRadiusMeters: number | null;
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

export interface Employee {
  publicId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string | null;
  phoneNumber: string | null;
  active: boolean;
  qrToken: string | null;
  shiftName: string | null;
  shiftPublicId: string | null;
  createdAt: string;
  attendance?: AttendanceRecord[];
}

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
}

export interface LeaveRequest {
  publicId: string;
  employeePublicId: string;
  employeeName: string;
  date: string;
  startDate: string;
  endDate: string;
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
  plan: 'free' | 'brew_plus';
  planLabel: string;
  isBrewPlus: boolean;
  employeeLimit: number | null;
  remainingEmployeeSlots: number | null;
  canUseIpRestriction: boolean;
  canUseGeofencing: boolean;
  canUseLeaveRequests: boolean;
  canUseShiftTimeRules: boolean;
  currentPeriodEnd: string | null;
  status: string;
  paddleSubscriptionId: string | null;
}

export interface RoleContext {
  isOwner: boolean;
  isEmployee: boolean;
  onboardingCompleted: boolean;
  ownedWorkspaces: { publicId: string; name: string }[];
  employee: {
    publicId: string;
    name: string;
    workspacePublicId: string | null;
    workspaceName: string | null;
    qrToken: string | null;
  } | null;
}
