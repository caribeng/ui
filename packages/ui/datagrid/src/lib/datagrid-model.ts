/** Tipo de dato (y de editor) de una columna del Data Grid. */
export type CbDataGridColumnType = 'text' | 'number' | 'select' | 'date' | 'checkbox';

/** Opción de una columna `select`. */
export interface CbDataGridOption {
  readonly label: string;
  readonly value: unknown;
}

/** Fila del Data Grid: un objeto con los campos de las columnas. */
export type CbDataGridRow = Record<string, unknown>;

/** Columna del Data Grid. */
export interface CbDataGridColumn<T extends object = CbDataGridRow> {
  /** Campo de la fila que muestra y edita. */
  readonly field: string;
  readonly header: string;
  /** `text` por defecto. */
  readonly type?: CbDataGridColumnType;
  /** Ancho CSS (`8rem` por defecto; `checkbox`, `5rem`). */
  readonly width?: string;
  /** `false` la deja de solo lectura aunque el grid sea editable. */
  readonly editable?: boolean;
  /** No admite celdas vacías. */
  readonly required?: boolean;
  /** Opciones de una columna `select`. */
  readonly options?: readonly CbDataGridOption[];
  /** Límites de una columna `number`. */
  readonly min?: number;
  readonly max?: number;
  /** Decimales que se muestran en una columna `number`. */
  readonly decimals?: number;
  /** `false` quita la ordenación por esta columna. */
  readonly sortable?: boolean;
  readonly align?: 'start' | 'center' | 'end';
  /** Validación propia: devuelve el mensaje de error o `null`. */
  readonly validate?: (value: unknown, row: T) => string | null;
  /** Texto que se muestra en la celda (no cambia el valor). */
  readonly format?: (value: unknown, row: T) => string;
}

/** Cambio de una celda (`cellChange`). */
export interface CbDataGridCellChange<T extends object = CbDataGridRow> {
  readonly row: T;
  readonly field: string;
  readonly value: unknown;
  readonly previous: unknown;
}

/** Error de validación de una celda. */
export interface CbDataGridError {
  /** Clave de la fila (`dataKey`). */
  readonly key: unknown;
  readonly field: string;
  readonly message: string;
}

/** Textos de validación (vienen de la traducción activa). */
export interface ValidationTexts {
  readonly required: string;
  readonly min: string;
  readonly max: string;
  readonly number: string;
  readonly date: string;
  readonly option: string;
}

/** Celda en coordenadas de la vista (fila visible, columna). */
export interface CellPos {
  readonly r: number;
  readonly c: number;
}

/** Rango rectangular normalizado. */
export interface CellRange {
  readonly r1: number;
  readonly r2: number;
  readonly c1: number;
  readonly c2: number;
}

export function rangeOf(a: CellPos, b: CellPos): CellRange {
  return { r1: Math.min(a.r, b.r), r2: Math.max(a.r, b.r), c1: Math.min(a.c, b.c), c2: Math.max(a.c, b.c) };
}

export function inRange(range: CellRange, r: number, c: number): boolean {
  return r >= range.r1 && r <= range.r2 && c >= range.c1 && c <= range.c2;
}

export function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

const TRUE_WORDS = new Set(['true', '1', 'x', 'sí', 'si', 'yes', 'y', 's', 'verdadero', '✓']);
const FALSE_WORDS = new Set(['false', '0', 'no', 'n', 'falso', '']);

/**
 * Convierte el texto escrito o pegado en el valor de la columna. Devuelve
 * `error` cuando el texto no se puede interpretar (no es un número, una fecha…).
 */
export function parseCell(col: CbDataGridColumn<object>, text: string, texts: ValidationTexts): { value: unknown; error?: string } {
  const raw = text.trim();
  switch (col.type ?? 'text') {
    case 'number': {
      if (!raw) return { value: null };
      // Admite coma decimal y separadores de miles: "1.234,5", "1,234.5", "1234,5".
      let s = raw.replace(/\s/g, '');
      const comma = s.lastIndexOf(',');
      const dot = s.lastIndexOf('.');
      if (comma > dot) s = s.replace(/\./g, '').replace(',', '.');
      else s = s.replace(/,/g, '');
      const n = Number(s);
      return Number.isFinite(n) ? { value: n } : { value: text, error: texts.number };
    }
    case 'checkbox': {
      const w = raw.toLowerCase();
      if (TRUE_WORDS.has(w)) return { value: true };
      if (FALSE_WORDS.has(w)) return { value: false };
      return { value: false };
    }
    case 'select': {
      if (!raw) return { value: null };
      const low = raw.toLowerCase();
      const opt = (col.options ?? []).find((o) => o.label.toLowerCase() === low || String(o.value).toLowerCase() === low);
      return opt ? { value: opt.value } : { value: text, error: texts.option };
    }
    case 'date': {
      if (!raw) return { value: null };
      const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(raw);
      const dmy = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(raw);
      const [y, m, d] = iso ? [+iso[1], +iso[2], +iso[3]] : dmy ? [+dmy[3], +dmy[2], +dmy[1]] : [NaN, NaN, NaN];
      const date = new Date(y, m - 1, d);
      if (Number.isNaN(date.getTime()) || date.getMonth() !== m - 1 || date.getDate() !== d) return { value: text, error: texts.date };
      return { value: isoDate(date) };
    }
    default:
      return { value: text };
  }
}

export function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Mensaje de error de una celda (obligatoria, límites y validación propia) o `null`. */
export function validateCell(col: CbDataGridColumn<object>, value: unknown, row: object, texts: ValidationTexts): string | null {
  if (isEmpty(value)) return col.required ? texts.required : null;
  const type = col.type ?? 'text';
  if (type === 'number') {
    if (typeof value !== 'number') return texts.number;
    if (col.min !== undefined && value < col.min) return texts.min.replace('{0}', String(col.min));
    if (col.max !== undefined && value > col.max) return texts.max.replace('{0}', String(col.max));
  }
  if (type === 'select' && !(col.options ?? []).some((o) => o.value === value)) return texts.option;
  if (type === 'date' && (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))) return texts.date;
  return col.validate?.(value, row) ?? null;
}

/** Texto plano de una celda: el que se ve, se copia y se ordena. */
export function cellText(col: CbDataGridColumn<object>, value: unknown, row: object, locale: string, yesNo: [string, string]): string {
  if (col.format) return col.format(value, row);
  if (isEmpty(value)) return '';
  switch (col.type ?? 'text') {
    case 'number':
      return typeof value === 'number'
        ? new Intl.NumberFormat(locale, col.decimals === undefined ? undefined : { minimumFractionDigits: col.decimals, maximumFractionDigits: col.decimals }).format(value)
        : String(value);
    case 'checkbox':
      return value ? yesNo[0] : yesNo[1];
    case 'select':
      return (col.options ?? []).find((o) => o.value === value)?.label ?? String(value);
    case 'date': {
      const m = typeof value === 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
      return m ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(+m[1], +m[2] - 1, +m[3])) : String(value);
    }
    default:
      return String(value);
  }
}

/** Texto que se pone en el portapapeles: los números sin separador de miles para que se vuelvan a pegar bien. */
export function copyText(col: CbDataGridColumn<object>, value: unknown, row: object, locale: string, yesNo: [string, string]): string {
  if (isEmpty(value)) return '';
  if ((col.type ?? 'text') === 'number' && typeof value === 'number') return String(value);
  if (col.type === 'date' && typeof value === 'string') return value;
  return cellText(col, value, row, locale, yesNo);
}

/** Compara dos valores de una columna para ordenar (vacíos al final). */
export function compareCells(col: CbDataGridColumn<object>, a: unknown, b: unknown, locale: string): number {
  if (isEmpty(a) || isEmpty(b)) return isEmpty(a) === isEmpty(b) ? 0 : isEmpty(a) ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  if (col.type === 'select') {
    const label = (v: unknown) => (col.options ?? []).find((o) => o.value === v)?.label ?? String(v);
    return label(a).localeCompare(label(b), locale, { numeric: true, sensitivity: 'base' });
  }
  return String(a).localeCompare(String(b), locale, { numeric: true, sensitivity: 'base' });
}

/** Matriz de textos a TSV (el formato de Excel y Google Sheets al copiar). */
export function toTsv(rows: readonly (readonly string[])[]): string {
  const quote = (s: string) => (/[\t\n"\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  return rows.map((r) => r.map(quote).join('\t')).join('\n');
}

/** TSV (lo que llega al pegar de una hoja de cálculo) a matriz de textos. */
export function fromTsv(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const src = text.replace(/\r\n?/g, '\n');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === '\t') {
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
  return out;
}
