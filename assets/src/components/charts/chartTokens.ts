/**
 * Chart series definitions shared by the dashboard charts.
 *
 * The colours live in CSS (`--db-chart-*` in globals.css) rather than here so
 * light/dark switch with the theme instead of needing a re-render, and so the
 * two frontends can't drift to different fills.
 */

export type AttendanceSeriesKey = "onTime" | "late" | "leave" | "absent";

export interface AttendanceSeries {
  key: AttendanceSeriesKey;
  color: string;
  /** English fallback; the chart resolves the real label through i18n. */
  defaultLabel: string;
  i18nKey: string;
}

/**
 * Stack order, bottom → top.
 *
 * On-time sits on the baseline so the good news is the part anchored to the
 * axis. It also puts on-time and late — the pair the colourblind check found
 * closest — directly adjacent, which is where the 2px surface gap and the
 * legend do the separating work; keeping them apart in the stack would put a
 * weaker-separated pair somewhere else instead.
 */
export const ATTENDANCE_SERIES: AttendanceSeries[] = [
  { key: "onTime", color: "var(--db-chart-ontime)", defaultLabel: "On time", i18nKey: "charts.onTime" },
  { key: "late", color: "var(--db-chart-late)", defaultLabel: "Late", i18nKey: "charts.late" },
  { key: "leave", color: "var(--db-chart-leave)", defaultLabel: "On leave", i18nKey: "charts.leave" },
  { key: "absent", color: "var(--db-chart-absent)", defaultLabel: "Absent", i18nKey: "charts.absent" },
];

export const CHART_MUTED = "var(--db-chart-muted)";
export const CHART_GRID = "var(--db-chart-grid)";

/** Monday-first short weekday names in the viewer's locale — no i18n keys needed. */
export function weekdayLabels(locale: string, format: "short" | "narrow" = "short"): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: format, timeZone: "UTC" });
  // 2024-01-01 was a Monday, so +n days walks Mon → Sun.
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(new Date(Date.UTC(2024, 0, 1 + i))),
  );
}
