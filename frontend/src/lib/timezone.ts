/**
 * Workspace-timezone-aware date/time utilities. All "today"/time-of-day
 * computations go through here so the frontend agrees with the backend on
 * the calendar day and renders times in the workspace timezone.
 */

/** Today's date (YYYY-MM-DD) in the given IANA timezone. */
export function todayInTimezone(tz: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}

/** First day of the current month (YYYY-MM-01) in the given timezone. */
export function startOfMonthInTimezone(tz: string): string {
  return `${todayInTimezone(tz).slice(0, 7)}-01`;
}

/** Parse YYYY-MM-DD as UTC midnight (no browser-offset drift). */
export function parseDateAsUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Format a Date to YYYY-MM-DD using UTC getters. */
export function formatDateUTC(date: Date): string {
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Format an ISO datetime to "HH:MM" in the workspace timezone. */
export function formatTimeInTz(iso: string | null | undefined, tz: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
