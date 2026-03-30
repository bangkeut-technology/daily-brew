/**
 * Format a date string according to the workspace date format setting.
 * @param dateStr - ISO date string (YYYY-MM-DD or full ISO)
 * @param format - 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
 */
export function formatDate(dateStr: string, format: string = 'DD/MM/YYYY'): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

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
