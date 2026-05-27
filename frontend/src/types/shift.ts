export interface Shift {
  publicId: string;
  name: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  graceLateMinutes: number;
  graceEarlyMinutes: number;
}
