/**
 * Fecha relativa a `now` ("hace 5 minutos", "ayer", "en 2 horas") en el idioma `locale`;
 * a partir de una semana, la fecha corta ("23 oct 2026"). Por debajo de un minuto devuelve
 * `justNow` ("ahora mismo").
 *
 * @example
 * ```ts
 * cbRelativeTime(comment.date, Date.now(), t().intlLocale, t().commentsJustNow);
 * ```
 */
export function cbRelativeTime(date: Date | string | number, now: number, locale: string, justNow: string): string {
  const time = date instanceof Date ? date.getTime() : typeof date === 'number' ? date : new Date(date).getTime();
  if (Number.isNaN(time)) return '';
  const diff = Math.round((time - now) / 1000);
  const abs = Math.abs(diff);
  if (abs < 60) return justNow;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 7 * 86400) return rtf.format(Math.round(diff / 86400), 'day');
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(time);
}
