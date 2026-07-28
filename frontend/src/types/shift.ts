/**
 * A per-day override on a shift (Espresso). A shift carrying *any* rule is
 * treated as its complete schedule: days without a rule are off-days for that
 * shift, not "fall back to the default times".
 */
export interface ShiftTimeRule {
  publicId: string;
  /** ISO day of week, 1 = Monday. */
  dayOfWeek: number;
  dayOfWeekLabel: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export interface Shift {
  publicId: string;
  name: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  graceLateMinutes: number;
  graceEarlyMinutes: number;
  timeRules: ShiftTimeRule[];
}
