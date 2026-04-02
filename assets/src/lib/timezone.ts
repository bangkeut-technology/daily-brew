/**
 * Workspace-timezone-aware date utilities.
 *
 * All "today" / "now" computations go through here so the frontend
 * always agrees with the backend on which calendar day it is.
 */

/**
 * Get current date/time in the workspace timezone.
 * Returns a Date object whose getters reflect the workspace-local time.
 */
export function nowInTimezone(tz: string): Date {
  // Build an ISO string in the target timezone, then parse it
  const str = new Date().toLocaleString('en-US', { timeZone: tz });
  return new Date(str);
}

/**
 * Get today's date string (YYYY-MM-DD) in the workspace timezone.
 */
export function todayInTimezone(tz: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const y = parts.find((p) => p.type === 'year')!.value;
  const m = parts.find((p) => p.type === 'month')!.value;
  const d = parts.find((p) => p.type === 'day')!.value;
  return `${y}-${m}-${d}`;
}

/**
 * Get midnight Date for "today" in the workspace timezone.
 * Useful for date range comparisons (closures, leaves).
 */
export function todayMidnightInTimezone(tz: string): Date {
  const dateStr = todayInTimezone(tz);
  // Parse as UTC midnight to avoid browser-TZ shift
  return parseDateAsUTC(dateStr);
}

/**
 * Parse a YYYY-MM-DD date string as UTC midnight.
 * Prevents the browser from shifting the date by its local offset.
 */
export function parseDateAsUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Format a Date to YYYY-MM-DD using UTC getters.
 * Use after parseDateAsUTC to avoid timezone drift.
 */
export function formatDateUTC(date: Date): string {
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = date.getUTCDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get the start-of-month date string in workspace timezone.
 */
export function startOfMonthInTimezone(tz: string): string {
  const today = todayInTimezone(tz);
  return today.slice(0, 8) + '01';
}

/**
 * Get the end-of-month date string in workspace timezone.
 */
export function endOfMonthInTimezone(tz: string): string {
  const today = todayInTimezone(tz);
  const [y, m] = today.split('-').map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}
