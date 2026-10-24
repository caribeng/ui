/** Tipo de periodo contable. */
export type CbPeriodKind = 'month' | 'quarter' | 'year' | 'range';

/** Periodo contable elegido. */
export interface CbPeriod {
  readonly kind: CbPeriodKind;
  /** Primer día (00:00). */
  readonly from: Date;
  /** Último día (00:00). */
  readonly to: Date;
  /** Clave estable: `2026-10`, `2026-Q3`, `2026` (año fiscal) o `2026-01-01_2026-10-23`. */
  readonly key: string;
}

/** Atajos de periodo. */
export type CbPeriodPreset = 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter' | 'yearToDate' | 'thisYear' | 'lastYear';

const pad = (n: number) => String(n).padStart(2, '0');

export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function lastDay(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

/** Mes: `2026-10`. */
export function monthPeriod(year: number, month: number): CbPeriod {
  return { kind: 'month', from: new Date(year, month, 1), to: lastDay(year, month), key: `${year}-${pad(month + 1)}` };
}

/**
 * Año fiscal que empieza en `startMonth` (0 = enero). Se nombra por el año en
 * que termina (con inicio en julio, el año fiscal 2026 va de jul 2025 a jun 2026).
 */
export function fiscalYear(year: number, startMonth = 0): CbPeriod {
  const from = new Date(startMonth === 0 ? year : year - 1, startMonth, 1);
  const to = lastDay(from.getFullYear() + 1, startMonth - 1);
  return { kind: 'year', from, to, key: String(year) };
}

/** Trimestre `q` (1–4) del año fiscal `year`. */
export function quarterPeriod(year: number, q: number, startMonth = 0): CbPeriod {
  const fy = fiscalYear(year, startMonth);
  const from = new Date(fy.from.getFullYear(), fy.from.getMonth() + (q - 1) * 3, 1);
  const to = lastDay(from.getFullYear(), from.getMonth() + 2);
  return { kind: 'quarter', from, to, key: `${year}-Q${q}` };
}

export function rangePeriod(from: Date, to: Date): CbPeriod {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return { kind: 'range', from: a, to: b, key: `${isoDay(a)}_${isoDay(b)}` };
}

/** Año fiscal al que pertenece una fecha. */
export function fiscalYearOf(date: Date, startMonth = 0): number {
  return startMonth === 0 || date.getMonth() < startMonth ? date.getFullYear() : date.getFullYear() + 1;
}

/** Trimestre fiscal (1–4) de una fecha. */
export function quarterOf(date: Date, startMonth = 0): number {
  return Math.floor((((date.getMonth() - startMonth) % 12) + 12) % 12 / 3) + 1;
}

/** Periodo de un atajo respecto a `today`. */
export function presetPeriod(preset: CbPeriodPreset, today: Date, startMonth = 0): CbPeriod {
  const y = today.getFullYear();
  const m = today.getMonth();
  const fy = fiscalYearOf(today, startMonth);
  const q = quarterOf(today, startMonth);
  switch (preset) {
    case 'thisMonth':
      return monthPeriod(y, m);
    case 'lastMonth':
      return m === 0 ? monthPeriod(y - 1, 11) : monthPeriod(y, m - 1);
    case 'thisQuarter':
      return quarterPeriod(fy, q, startMonth);
    case 'lastQuarter':
      return q === 1 ? quarterPeriod(fy - 1, 4, startMonth) : quarterPeriod(fy, q - 1, startMonth);
    case 'yearToDate':
      return rangePeriod(fiscalYear(fy, startMonth).from, today);
    case 'thisYear':
      return fiscalYear(fy, startMonth);
    case 'lastYear':
      return fiscalYear(fy - 1, startMonth);
  }
}

/** Meses (`AAAA-MM`) que abarca un periodo. */
export function monthsOf(period: CbPeriod): string[] {
  const out: string[] = [];
  const d = new Date(period.from.getFullYear(), period.from.getMonth(), 1);
  while (d <= period.to) {
    out.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
    d.setMonth(d.getMonth() + 1);
  }
  return out;
}

/** El periodo incluye algún mes cerrado. */
export function touchesClosed(period: CbPeriod, closed: ReadonlySet<string>): boolean {
  return closed.size > 0 && monthsOf(period).some((m) => closed.has(m));
}

/** Periodo a partir de su clave (`2026-10`, `2026-Q3`, `2026`, `2026-01-01_2026-03-31`). */
export function periodFromKey(key: string, startMonth = 0): CbPeriod | null {
  let m = /^(\d{4})-(\d{2})$/.exec(key);
  if (m) return monthPeriod(+m[1], +m[2] - 1);
  m = /^(\d{4})-Q([1-4])$/.exec(key);
  if (m) return quarterPeriod(+m[1], +m[2], startMonth);
  m = /^(\d{4})$/.exec(key);
  if (m) return fiscalYear(+m[1], startMonth);
  m = /^(\d{4})-(\d{2})-(\d{2})_(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (m) return rangePeriod(new Date(+m[1], +m[2] - 1, +m[3]), new Date(+m[4], +m[5] - 1, +m[6]));
  return null;
}
