import { format, toZonedTime } from 'date-fns-tz';
import { es } from 'date-fns/locale';

const COLOMBIA_TZ = 'America/Bogota';

/**
 * Format a date to Colombia timezone
 * @param date - Date to format
 * @param formatStr - Format string (default: "dd MMM yyyy 'a las' HH:mm")
 * @returns Formatted date string in Colombia timezone
 */
export function formatDateColombia(date: Date | string, formatStr: string = "dd MMM yyyy 'a las' HH:mm"): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const zonedDate = toZonedTime(dateObj, COLOMBIA_TZ);
  return format(zonedDate, formatStr, { locale: es, timeZone: COLOMBIA_TZ });
}

/**
 * Format a date to Colombia timezone - short format (dd/MM/yyyy)
 */
export function formatDateShortColombia(date: Date | string): string {
  return formatDateColombia(date, 'dd/MM/yyyy');
}

/**
 * Format a date to Colombia timezone - long format with day name
 */
export function formatDateLongColombia(date: Date | string): string {
  return formatDateColombia(date, "EEEE, dd 'de' MMMM 'de' yyyy");
}

/**
 * Format a date to Colombia timezone - date and time
 */
export function formatDateTimeColombia(date: Date | string): string {
  return formatDateColombia(date, "dd MMM yyyy 'a las' HH:mm");
}

/**
 * Format a date to Colombia timezone - only time
 */
export function formatTimeColombia(date: Date | string): string {
  return formatDateColombia(date, 'HH:mm');
}

/**
 * Get current date/time in Colombia timezone
 */
export function nowColombia(): Date {
  return toZonedTime(new Date(), COLOMBIA_TZ);
}

/**
 * Convert a date to Colombia timezone
 */
export function toColombiaTime(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return toZonedTime(dateObj, COLOMBIA_TZ);
}

/**
 * Convert a Colombia local date/time to UTC
 * Takes a date that represents a local Colombia time and returns the equivalent UTC date
 */
export function colombiaTimeToUtc(localDate: Date): Date {
  const year = localDate.getFullYear();
  const month = localDate.getMonth();
  const day = localDate.getDate();
  const hours = localDate.getHours();
  const minutes = localDate.getMinutes();
  const seconds = localDate.getSeconds();
  const ms = localDate.getMilliseconds();
  
  const isoString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  
  const utcDate = new Date(isoString + '-05:00');
  
  return utcDate;
}
