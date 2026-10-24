import { cbFormatAmount, type CbNegativeStyle, type CbSummary } from '@caribeng/ui';

/** Tipo de dato (y de editor) de una columna del Data Grid. */
export type CbDataGridColumnType = 'text' | 'number' | 'select' | 'autocomplete' | 'date' | 'checkbox';

/** Opción de una columna `select` o `autocomplete`. */
export interface CbDataGridOption {
  readonly label: string;
  readonly value: unknown;
  /** Texto secundario en la lista de `autocomplete` (p. ej. la ruta de una cuenta). */
  readonly description?: string;
  /** Se ve en la lista pero no se puede elegir. */
  readonly disabled?: boolean;
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
  /** Opciones de una columna `select` o `autocomplete` (en esta se buscan escribiendo). */
  readonly options?: readonly CbDataGridOption[];
  /**
   * Al editar (escribir, pegar, borrar o rellenar) esta celda, otros campos de la
   * fila que cambian con ella, en el mismo paso de deshacer. P. ej., en un
   * comprobante, escribir el débito borra el crédito: `onEdit: (v) => (v ? { credito: null } : null)`.
   */
  readonly onEdit?: (value: unknown, row: T) => Partial<T> | null;
  /** Límites de una columna `number`. */
  readonly min?: number;
  readonly max?: number;
  /** Decimales que se muestran en una columna `number`. */
  readonly decimals?: number;
  /**
   * Importe en moneda (columna `number`): un código ISO 4217 (`COP`) o `true` para la
   * moneda del grid / `provideCaribeNG({ currency })`.
   */
  readonly currency?: string | boolean;
  /** Negativos con signo o entre paréntesis (si no, el del grid). */
  readonly negative?: CbNegativeStyle;
  /** Total en el pie: `sum`, `avg`, `count`, `min`, `max` o una función con las filas. */
  readonly summary?: CbSummary | ((rows: readonly T[]) => unknown);
  /** Texto fijo en el pie de esta columna (p. ej. "Total"). */
  readonly footer?: string;
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
    case 'select':
    case 'autocomplete': {
      if (!raw) return { value: null };
      const opt = findOption(col.options ?? [], raw);
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

/** Minúsculas y sin tildes. */
export function fold(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * Opción que corresponde a un texto escrito o pegado: por valor, por etiqueta
 * exacta o por el código con el que empieza la etiqueta ("110505" → "110505 Caja general").
 */
export function findOption(options: readonly CbDataGridOption[], text: string): CbDataGridOption | undefined {
  const q = fold(text);
  if (!q) return undefined;
  const usable = options.filter((o) => !o.disabled);
  return (
    usable.find((o) => fold(String(o.value)) === q) ??
    usable.find((o) => fold(o.label) === q) ??
    usable.find((o) => fold(o.label).startsWith(q + ' '))
  );
}

/**
 * Opciones de `autocomplete` que coinciden con lo escrito: primero las que
 * empiezan por el texto (por código), después las que lo contienen; sin tildes.
 */
export function searchOptions(options: readonly CbDataGridOption[], text: string, limit = 50): CbDataGridOption[] {
  const q = fold(text);
  if (!q) return options.slice(0, limit);
  const starts: CbDataGridOption[] = [];
  const contains: CbDataGridOption[] = [];
  for (const o of options) {
    const label = fold(o.label);
    if (label.startsWith(q) || fold(String(o.value)).startsWith(q)) starts.push(o);
    else if (label.includes(q) || (o.description && fold(o.description).includes(q))) contains.push(o);
  }
  return [...starts, ...contains].slice(0, limit);
}

export function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Mensaje de error de una celda (obligatoria, límites y validación propia) o `null`. */
export function validateCell(col: CbDataGridColumn<object>, value: unknown, row: object, texts: ValidationTexts): string | null {
  // Vacía: obligatoria, o la validación propia (puede exigirla según la fila).
  if (isEmpty(value)) return col.required ? texts.required : (col.validate?.(value, row) ?? null);
  const type = col.type ?? 'text';
  if (type === 'number') {
    if (typeof value !== 'number') return texts.number;
    if (col.min !== undefined && value < col.min) return texts.min.replace('{0}', String(col.min));
    if (col.max !== undefined && value > col.max) return texts.max.replace('{0}', String(col.max));
  }
  if ((type === 'select' || type === 'autocomplete') && !(col.options ?? []).some((o) => o.value === value)) return texts.option;
  if (type === 'date' && (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))) return texts.date;
  return col.validate?.(value, row) ?? null;
}

/** Moneda y negativos por defecto del grid (para las columnas con `currency: true`). */
export interface AmountDefaults {
  readonly currency?: string | null;
  /** Idioma de los importes (si no, el de la interfaz). */
  readonly locale?: string;
  readonly negative?: CbNegativeStyle;
}

/** Texto plano de una celda: el que se ve, se copia y se ordena. */
export function cellText(col: CbDataGridColumn<object>, value: unknown, row: object, locale: string, yesNo: [string, string], amount: AmountDefaults = {}): string {
  if (col.format) return col.format(value, row);
  if (isEmpty(value)) return '';
  switch (col.type ?? 'text') {
    case 'number': {
      if (typeof value !== 'number') return String(value);
      const currency = typeof col.currency === 'string' ? col.currency : col.currency ? (amount.currency ?? null) : null;
      const negative = col.negative ?? amount.negative ?? 'minus';
      const numberLocale = amount.locale ?? locale;
      if (currency || col.decimals !== undefined || negative === 'parens') return cbFormatAmount(value, numberLocale, { currency, decimals: col.decimals, negative });
      return new Intl.NumberFormat(numberLocale).format(value);
    }
    case 'checkbox':
      return value ? yesNo[0] : yesNo[1];
    case 'select':
    case 'autocomplete':
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
  if (col.type === 'select' || col.type === 'autocomplete') {
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
