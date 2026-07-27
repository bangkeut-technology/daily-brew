/**
 * Fixed date formatting for the platform-admin screens.
 *
 * Admin spans every workspace, so it can't use the per-workspace `dateFormat`
 * setting the console honours — and a bare `toLocaleDateString()` follows the
 * *browser* locale, which renders 2026-01-08 as "1/8/2026" for a US-locale
 * admin and "08/01/2026" for everyone else. Both shapes end up on screen
 * during a single support session and neither says which one it is.
 *
 * So /admin pins one format: DD/MM/YYYY, plus a 24-hour clock for datetimes.
 */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

interface Parts {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
}

function parts(value: string): Parts | null {
  // A bare YYYY-MM-DD is parsed as UTC midnight, so local getters would shift
  // it a day backwards west of Greenwich. Full ISO timestamps carry an offset
  // and are correctly rendered in the viewer's own time.
  const isDateOnly = DATE_ONLY.test(value);
  const d = new Date(isDateOnly ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(d.getTime())) return null;

  const pad = (n: number) => n.toString().padStart(2, "0");
  return isDateOnly
    ? {
        day: pad(d.getUTCDate()),
        month: pad(d.getUTCMonth() + 1),
        year: String(d.getUTCFullYear()),
        hour: "00",
        minute: "00",
      }
    : {
        day: pad(d.getDate()),
        month: pad(d.getMonth() + 1),
        year: String(d.getFullYear()),
        hour: pad(d.getHours()),
        minute: pad(d.getMinutes()),
      };
}

/** DD/MM/YYYY — "—" when the value is missing or unparseable. */
export function formatAdminDate(value: string | null | undefined): string {
  if (!value) return "—";
  const p = parts(value);
  if (!p) return "—";
  return `${p.day}/${p.month}/${p.year}`;
}

/** DD/MM/YYYY HH:mm on a 24-hour clock. */
export function formatAdminDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const p = parts(value);
  if (!p) return "—";
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute}`;
}

/** DD/MM — compact form for chart axis ticks, where the year is implied. */
export function formatAdminDayMonth(value: string | null | undefined): string {
  if (!value) return "";
  const p = parts(value);
  if (!p) return "";
  return `${p.day}/${p.month}`;
}
