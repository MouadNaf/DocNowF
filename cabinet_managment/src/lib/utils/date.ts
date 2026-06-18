/** Local calendar date as YYYY-MM-DD (avoids UTC shift from toISOString). */
export function localDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatAppointmentTime(time?: string | null): string {
  if (!time || typeof time !== 'string') return '--:--';
  return time.length >= 5 ? time.slice(0, 5) : time;
}
