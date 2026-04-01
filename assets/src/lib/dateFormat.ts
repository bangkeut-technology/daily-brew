/**
 * Format a date string according to the workspace date format setting.
 * Uses UTC getters to prevent browser-timezone drift on ISO date strings.
 *
 * @param dateStr - ISO date string (YYYY-MM-DD or full ISO)
 * @param format - 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
 */
export function formatDate(dateStr: string, format: string = 'DD/MM/YYYY'): string {
  if (!dateStr) return '';

  // For date-only strings (YYYY-MM-DD), parse as UTC to avoid day shift
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  const d = isDateOnly
    ? new Date(dateStr + 'T00:00:00Z')
    : new Date(dateStr);

  if (isNaN(d.getTime())) return dateStr;

  // Use UTC getters for date-only strings, local getters for full datetimes
  const day = (isDateOnly ? d.getUTCDate() : d.getDate()).toString().padStart(2, '0');
  const month = ((isDateOnly ? d.getUTCMonth() : d.getMonth()) + 1).toString().padStart(2, '0');
  const year = isDateOnly ? d.getUTCFullYear() : d.getFullYear();

  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
    default:
      return `${day}/${month}/${year}`;
  }
}
