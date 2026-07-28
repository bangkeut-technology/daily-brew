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

/** One calendar day of the rolling window. Every day in the range is present, including empty ones. */
export interface TrendDay {
  date: string;
  /** ISO day of week, 1 = Monday. */
  dayOfWeek: number;
  onTime: number;
  late: number;
  leave: number;
  absent: number;
  /** The whole day was swallowed by a closure — nobody was expected. */
  closed: boolean;
  /** present + absent. Leave is not a miss, so it stays out of the denominator. */
  expected: number;
  attendanceRate: number;
  onTimeRate: number;
}

export interface TrendWeekday {
  dayOfWeek: number;
  onTime: number;
  late: number;
  absent: number;
  present: number;
  onTimeRate: number;
  /** False when the window contained no expectation for this weekday at all. */
  hasData: boolean;
}

export interface TrendLateEmployee {
  employeePublicId: string;
  employeeName: string;
  late: number;
  present: number;
  absent: number;
  lateRate: number;
}

export interface DashboardTrends {
  from: string;
  to: string;
  days: number;
  daily: TrendDay[];
  byWeekday: TrendWeekday[];
  topLate: TrendLateEmployee[];
  totals: {
    onTime: number;
    late: number;
    leave: number;
    absent: number;
    present: number;
    expected: number;
    attendanceRate: number;
    onTimeRate: number;
    previousAttendanceRate: number;
    previousOnTimeRate: number;
  };
}
