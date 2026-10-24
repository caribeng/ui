/** Tipo de un campo a importar (cómo se interpreta el texto). */
export type CbImportFieldType = 'text' | 'number' | 'date' | 'boolean';

/** Campo de destino de la importación. */
export interface CbImportField {
  readonly key: string;
  readonly label: string;
  readonly type?: CbImportFieldType;
  readonly required?: boolean;
  /** Otros nombres de columna con los que se asigna solo (p. ej. `['nit', 'documento']`). */
  readonly aliases?: readonly string[];
  /** Validación propia: mensaje de error o `null`. */
  readonly validate?: (value: unknown, row: Record<string, unknown>) => string | null;
}

/** Error de una celda importada. */
export interface CbImportError {
  /** Fila de datos (1 = la primera después del encabezado). */
  readonly row: number;
  readonly field: string;
  readonly message: string;
}

/** Resultado de la importación. */
export interface CbImportResult<T = Record<string, unknown>> {
  readonly rows: T[];
  readonly errors: CbImportError[];
  /** Filas descartadas por tener errores. */
  readonly skipped: number;
}

export type CbImportCell = string | number | boolean | null;

export interface ImportTexts {
  readonly required: string;
  readonly number: string;
  readonly date: string;
  readonly boolean: string;
}

export function fold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Separador más probable de un texto delimitado (tabulador, punto y coma o coma). */
export function detectDelimiter(text: string): string {
  const line = text.split(/\r?\n/).find((l) => l.trim()) ?? '';
  const count = (sep: string) => {
    let n = 0;
    let quoted = false;
    for (const ch of line) {
      if (ch === '"') quoted = !quoted;
      else if (ch === sep && !quoted) n++;
    }
    return n;
  };
  return ['\t', ';', ','].reduce((best, sep) => (count(sep) > count(best) ? sep : best), '\t');
}

/** CSV / TSV a filas (comillas dobles, saltos de línea dentro de comillas, BOM). */
export function parseDelimited(text: string, delimiter = detectDelimiter(text)): string[][] {
  const src = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const out: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      out.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    out.push(row);
  }
  // Sin filas totalmente vacías al final.
  while (out.length && out[out.length - 1].every((c) => !c.trim())) out.pop();
  return out;
}

/**
 * Importe a partir de texto: `$ 1.234,56`, `1,234.56`, `(1.234)` (negativo),
 * `-1234`, `1.234.567`. Con un solo separador repetido, o seguido de 3 cifras,
 * se toma como de miles.
 */
export function parseAmount(value: CbImportCell): number | null | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (value === null || value === '' || typeof value === 'boolean') return value === null || value === '' ? null : undefined;
  let s = value.trim();
  if (!s) return null;
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  s = s.replace(/[\s$€£¥]|COP|USD|EUR/gi, '');
  if (s.startsWith('-')) {
    negative = !negative;
    s = s.slice(1);
  }
  if (!/^[\d.,]+$/.test(s)) return undefined;
  const comma = s.lastIndexOf(',');
  const dot = s.lastIndexOf('.');
  if (comma >= 0 && dot >= 0) s = comma > dot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  else {
    const sep = comma >= 0 ? ',' : dot >= 0 ? '.' : '';
    if (sep) {
      const parts = s.split(sep);
      const thousands = parts.length > 2 || (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3 && parts[0] !== '0');
      s = thousands ? parts.join('') : parts.join('.');
    }
  }
  const n = Number(s);
  return Number.isFinite(n) ? (negative ? -n : n) : undefined;
}

/** Fecha a partir de texto (`AAAA-MM-DD`, `DD/MM/AAAA`, `DD-MM-AAAA`) o de un número de serie de Excel. */
export function parseDate(value: CbImportCell): Date | null | undefined {
  if (value === null || value === '') return null;
  if (typeof value === 'number') {
    if (value < 1 || value > 2958465) return undefined;
    const utc = new Date(Math.round((value - 25569) * 86400000));
    return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
  }
  if (typeof value !== 'string') return undefined;
  const s = value.trim();
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(s);
  let y: number, mo: number, d: number;
  if (m) [y, mo, d] = [+m[1], +m[2], +m[3]];
  else if ((m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/.exec(s))) [d, mo, y] = [+m[1], +m[2], +m[3] < 100 ? 2000 + +m[3] : +m[3]];
  else return undefined;
  const date = new Date(y, mo - 1, d);
  return date.getMonth() === mo - 1 && date.getDate() === d ? date : undefined;
}

const TRUE = new Set(['si', 'sí', 'yes', 'y', 's', 'true', 'verdadero', '1', 'x']);
const FALSE = new Set(['no', 'n', 'false', 'falso', '0']);

export function parseBoolean(value: CbImportCell): boolean | null | undefined {
  if (typeof value === 'boolean') return value;
  if (value === null || value === '') return null;
  const s = String(value).trim().toLowerCase();
  return TRUE.has(s) ? true : FALSE.has(s) ? false : undefined;
}

/** Asigna cada campo a la columna cuyo encabezado coincide con su clave, etiqueta o alias. */
export function autoMap(headers: readonly string[], fields: readonly CbImportField[]): Record<string, number | null> {
  const folded = headers.map((h) => fold(String(h ?? '')));
  const used = new Set<number>();
  const out: Record<string, number | null> = {};
  for (const f of fields) {
    const names = [f.key, f.label, ...(f.aliases ?? [])].map(fold);
    const i = folded.findIndex((h, idx) => !used.has(idx) && h && names.includes(h));
    out[f.key] = i >= 0 ? i : null;
    if (i >= 0) used.add(i);
  }
  return out;
}

/** Convierte las filas con la asignación de columnas: valores con tipo y errores por celda. */
export function convertRows(
  rows: readonly (readonly CbImportCell[])[],
  mapping: Readonly<Record<string, number | null>>,
  fields: readonly CbImportField[],
  texts: ImportTexts,
): { rows: Record<string, unknown>[]; errors: CbImportError[] } {
  const out: Record<string, unknown>[] = [];
  const errors: CbImportError[] = [];
  rows.forEach((source, i) => {
    const record: Record<string, unknown> = {};
    const rowErrors: CbImportError[] = [];
    for (const f of fields) {
      const col = mapping[f.key];
      const raw = col === null || col === undefined ? null : (source[col] ?? null);
      const type = f.type ?? 'text';
      let value: unknown;
      let error: string | null = null;
      if (type === 'number') {
        value = parseAmount(raw);
        if (value === undefined) error = texts.number;
      } else if (type === 'date') {
        value = parseDate(raw);
        if (value === undefined) error = texts.date;
      } else if (type === 'boolean') {
        value = parseBoolean(raw);
        if (value === undefined) error = texts.boolean;
      } else value = raw === null ? null : String(raw).trim();
      if (error) value = raw;
      else if (f.required && (value === null || value === '')) error = texts.required;
      record[f.key] = value;
      if (error) rowErrors.push({ row: i + 1, field: f.key, message: error });
    }
    for (const f of fields) {
      if (rowErrors.some((e) => e.field === f.key) || !f.validate) continue;
      const message = f.validate(record[f.key], record);
      if (message) rowErrors.push({ row: i + 1, field: f.key, message });
    }
    out.push(record);
    errors.push(...rowErrors);
  });
  return { rows: out, errors };
}
