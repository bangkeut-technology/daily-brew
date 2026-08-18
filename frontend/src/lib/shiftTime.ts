/**
 * An end time at or before the start means the shift runs past midnight —
 * "18:00 – 02:00" is a night shift, not a negative one. Both sides are the
 * zero-padded "HH:MM" the time picker produces, so a string compare is exact.
 *
 * There is no explicit overnight flag on a shift: the times themselves say it,
 * and the backend reads them the same way (see ResolvedShiftTimes).
 */
export function shiftCrossesMidnight(start: string, end: string): boolean {
  return !!start && !!end && end < start;
}
