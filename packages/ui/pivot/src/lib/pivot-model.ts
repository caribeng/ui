import { cbSummarize, type CbSummary } from '@caribeng/ui';

/** Medida de la tabla dinámica: qué campo se agrega y cómo. */
export interface CbPivotValue {
  readonly field: string;
  readonly aggregate?: CbSummary;
  readonly label?: string;
  /** `currency` (por defecto), `number` o `integer`. */
  readonly format?: 'currency' | 'number' | 'integer';
}

/** Dimensión disponible para filas o columnas (o medida, si es numérica). */
export interface CbPivotField {
  readonly key: string;
  readonly label: string;
  /** Texto de cada valor (p. ej. nombre de la cuenta a partir del código). */
  readonly format?: (value: unknown) => string;
}

/** Nodo de filas: un valor de una dimensión con sus hijos (siguiente dimensión). */
export interface PivotRowNode {
  readonly key: string;
  /** Ruta de valores desde la raíz (`['5135', 'Enel']`). */
  readonly path: readonly string[];
  readonly level: number;
  readonly label: string;
  readonly records: readonly Record<string, unknown>[];
  readonly children: readonly PivotRowNode[];
}

const SEP = '\u0001';

export function keyOf(record: Record<string, unknown>, fields: readonly string[]): string {
  return fields.map((f) => String(record[f] ?? '')).join(SEP);
}

export function splitKey(key: string): string[] {
  return key === '' ? [] : key.split(SEP);
}

function compare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/** Valores distintos (combinados) de las dimensiones de columna, ordenados. */
export function columnKeys(data: readonly Record<string, unknown>[], fields: readonly string[]): string[] {
  if (!fields.length) return [''];
  return [...new Set(data.map((r) => keyOf(r, fields)))].sort((a, b) => {
    const pa = splitKey(a);
    const pb = splitKey(b);
    for (let i = 0; i < pa.length; i++) {
      const c = compare(pa[i], pb[i]);
      if (c) return c;
    }
    return 0;
  });
}

/** Árbol de filas agrupando por cada dimensión de `fields`, en orden. */
export function rowTree(data: readonly Record<string, unknown>[], fields: readonly string[], labelOf: (field: string, value: string) => string, level = 0, path: string[] = []): PivotRowNode[] {
  if (level >= fields.length) return [];
  const field = fields[level];
  const groups = new Map<string, Record<string, unknown>[]>();
  for (const r of data) {
    const k = String(r[field] ?? '');
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(r);
  }
  return [...groups.keys()].sort(compare).map((k) => {
    const records = groups.get(k)!;
    const p = [...path, k];
    return { key: p.join(SEP), path: p, level, label: labelOf(field, k), records, children: rowTree(records, fields, labelOf, level + 1, p) };
  });
}

/** Valor agregado de una medida sobre unos registros. */
export function aggregate(records: readonly Record<string, unknown>[], value: CbPivotValue): number | null {
  return cbSummarize(records.map((r) => r[value.field]), value.aggregate ?? 'sum');
}
