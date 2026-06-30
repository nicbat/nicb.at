// ISO YYYY-MM-DD → "April 2026" (parsed as UTC to avoid a timezone off-by-one).
function formatMonthYear(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function formatDayMonthYear(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/**
 * A trip's date line: "April 2026 – June 2026", collapsed to a single month when start and end
 * land in the same month, or "" when there's no start date.
 */
export function formatTripDateRange(start: string, end: string): string {
  const s = formatMonthYear(start);
  const e = formatMonthYear(end);
  if (!s) return '';
  if (!e || e === s) return s;
  return `${s} – ${e}`;
}
