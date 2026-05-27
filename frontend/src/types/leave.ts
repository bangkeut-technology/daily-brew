export type LeaveStatus = "pending" | "approved" | "rejected";

export interface LeaveRequest {
  publicId: string;
  employeePublicId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  isFullDay: boolean;
  type: "paid" | "unpaid";
  reason: string | null;
  status: LeaveStatus;
  reviewedAt: string | null;
  createdAt: string;
}
