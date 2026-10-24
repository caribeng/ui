/** Documento pendiente (factura, cuenta de cobro…) con su saldo y vencimiento. */
export interface CbAgingDocument {
  readonly id: string | number;
  /** Tercero (cliente o proveedor). */
  readonly party: string;
  /** Número o referencia del documento. */
  readonly number?: string;
  /** Fecha de emisión (`Date` o `AAAA-MM-DD`). */
  readonly date?: Date | string;
  /** Fecha de vencimiento (`Date` o `AAAA-MM-DD`). */
  readonly due: Date | string;
  /** Saldo pendiente. */
  readonly balance: number;
}

/** Tramo de antigüedad: días vencidos desde `from` hasta `to` (sin `to`, en adelante). */
export interface CbAgingBucket {
  readonly key: string;
  readonly label: string;
  /** Días vencidos mínimos (negativo o `null`: por vencer). */
  readonly from: number | null;
  readonly to?: number | null;
}

/** Fila resumida por tercero. */
export interface CbAgingRow {
  readonly party: string;
  readonly documents: readonly CbAgingDocument[];
  /** Saldo de cada tramo, por `key`. */
  readonly buckets: Readonly<Record<string, number>>;
  readonly total: number;
  /** Días vencidos del documento más antiguo. */
  readonly maxDays: number;
}

/** Tramos habituales: por vencer, 1–30, 31–60, 61–90 y más de 90 días. */
export function cbDefaultBuckets(labels: { current: string; range: string; over: string }): CbAgingBucket[] {
  const range = (a: number, b: number) => labels.range.replace('{0}', String(a)).replace('{1}', String(b));
  return [
    { key: 'current', label: labels.current, from: null, to: 0 },
    { key: 'd30', label: range(1, 30), from: 1, to: 30 },
    { key: 'd60', label: range(31, 60), from: 31, to: 60 },
    { key: 'd90', label: range(61, 90), from: 61, to: 90 },
    { key: 'over', label: labels.over.replace('{0}', '90'), from: 91, to: null },
  ];
}

export function toDay(value: Date | string): Date {
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Días vencidos a la fecha de corte (negativo si aún no vence). */
export function daysOverdue(due: Date | string, asOf: Date): number {
  return Math.round((toDay(asOf).getTime() - toDay(due).getTime()) / 86400000);
}

/** Tramo al que pertenece un número de días vencidos. */
export function bucketOf(days: number, buckets: readonly CbAgingBucket[]): CbAgingBucket | undefined {
  return buckets.find((b) => (b.from === null || days >= b.from) && (b.to === null || b.to === undefined || days <= b.to));
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Agrupa los documentos por tercero y reparte sus saldos en los tramos. */
export function ageDocuments(documents: readonly CbAgingDocument[], buckets: readonly CbAgingBucket[], asOf: Date): CbAgingRow[] {
  const byParty = new Map<string, CbAgingDocument[]>();
  for (const doc of documents) {
    if (!byParty.has(doc.party)) byParty.set(doc.party, []);
    byParty.get(doc.party)!.push(doc);
  }
  return [...byParty].map(([party, docs]) => {
    const sums: Record<string, number> = Object.fromEntries(buckets.map((b) => [b.key, 0]));
    let maxDays = -Infinity;
    for (const doc of docs) {
      const days = daysOverdue(doc.due, asOf);
      maxDays = Math.max(maxDays, days);
      const bucket = bucketOf(days, buckets);
      if (bucket) sums[bucket.key] = round(sums[bucket.key] + doc.balance);
    }
    return { party, documents: docs, buckets: sums, total: round(docs.reduce((t, d) => t + d.balance, 0)), maxDays };
  });
}

/** Totales por tramo y general. */
export function agingTotals(rows: readonly CbAgingRow[], buckets: readonly CbAgingBucket[]): { buckets: Record<string, number>; total: number } {
  const out: Record<string, number> = Object.fromEntries(buckets.map((b) => [b.key, 0]));
  for (const row of rows) for (const b of buckets) out[b.key] = round(out[b.key] + (row.buckets[b.key] ?? 0));
  return { buckets: out, total: round(rows.reduce((t, r) => t + r.total, 0)) };
}
