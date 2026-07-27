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
