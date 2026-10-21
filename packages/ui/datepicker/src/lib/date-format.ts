/**
 * Formato de fechas con la sintaxis de PrimeNG / jQuery UI:
 *
 * - `d` / `dd`: día del mes (sin cero / dos dígitos)
 * - `o` / `oo`: día del año (sin ceros / tres dígitos)
 * - `D` / `DD`: nombre del día corto / largo
 * - `m` / `mm`: mes (sin cero / dos dígitos)
 * - `M` / `MM`: nombre del mes corto / largo
 * - `y` / `yy`: año (dos / cuatro dígitos)
 * - `@`: marca de tiempo Unix (ms desde 01/01/1970)
 * - `!`: ticks de Windows (100 ns desde 01/01/0001)
 * - `'...'`: texto literal; `''`: comilla simple; cualquier otro carácter, literal.
 *
 * Los nombres de días y meses salen de `Intl` en el `locale` indicado.
 */

/** Nombres de días (domingo primero) y meses en un idioma. */
export interface CbDateNames {
  dayShort: string[];
  dayLong: string[];
  monthShort: string[];
  monthLong: string[];
}

const namesCache = new Map<string, CbDateNames>();

/** Nombres de días y meses del `locale` (sin puntos finales: "ene" y no "ene."). */
export function dateNames(locale?: string): CbDateNames {
  const key = locale ?? '';
  const cached = namesCache.get(key);
  if (cached) return cached;
  const clean = (s: string) => s.replace(/\.$/, '');
  const day = (style: 'short' | 'long') => {
    const f = new Intl.DateTimeFormat(locale, { weekday: style });
    // 2023-01-01 fue domingo.
    return Array.from({ length: 7 }, (_, i) => clean(f.format(new Date(2023, 0, 1 + i))));
  };
  const month = (style: 'short' | 'long') => {
    const f = new Intl.DateTimeFormat(locale, { month: style });
    return Array.from({ length: 12 }, (_, i) => clean(f.format(new Date(2023, i, 15))));
  };
  const names = { dayShort: day('short'), dayLong: day('long'), monthShort: month('short'), monthLong: month('long') };
  namesCache.set(key, names);
  return names;
}

const TICKS_TO_EPOCH = 621_355_968_000_000_000;

type Token =
  | { kind: 'literal'; text: string }
  | { kind: 'd' | 'dd' | 'o' | 'oo' | 'D' | 'DD' | 'm' | 'mm' | 'M' | 'MM' | 'y' | 'yy' | '@' | '!' };

/** Divide un formato en símbolos y textos literales. */
function tokenize(format: string): Token[] {
  const tokens: Token[] = [];
  let literal = '';
  const flush = () => {
    if (literal) tokens.push({ kind: 'literal', text: literal });
    literal = '';
  };
  for (let i = 0; i < format.length; i++) {
    const c = format[i];
    if (c === "'") {
      if (format[i + 1] === "'") {
        literal += "'";
        i++;
        continue;
      }
      // Texto entre comillas; dentro, '' es una comilla.
      let j = i + 1;
      for (; j < format.length; j++) {
        if (format[j] !== "'") {
          literal += format[j];
        } else if (format[j + 1] === "'") {
          literal += "'";
          j++;
        } else {
          break;
        }
      }
      i = j;
      continue;
    }
    if ('doDmMy'.includes(c)) {
      flush();
      const double = format[i + 1] === c;
      tokens.push({ kind: (double ? c + c : c) as Token['kind'] } as Token);
      if (double) i++;
      continue;
    }
    if (c === '@' || c === '!') {
      flush();
      tokens.push({ kind: c } as Token);
      continue;
    }
    literal += c;
  }
  flush();
  return tokens;
}

function dayOfYear(d: Date): number {
  const start = Date.UTC(d.getFullYear(), 0, 1);
  return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - start) / 86_400_000) + 1;
}

const pad = (n: number, size: number) => String(n).padStart(size, '0');

/** Escribe una fecha con el formato indicado. */
export function formatDate(date: Date, format: string, names: CbDateNames): string {
  return tokenize(format)
    .map((t) => {
      switch (t.kind) {
        case 'literal':
          return t.text;
        case 'd':
          return String(date.getDate());
        case 'dd':
          return pad(date.getDate(), 2);
        case 'o':
          return String(dayOfYear(date));
        case 'oo':
          return pad(dayOfYear(date), 3);
        case 'D':
          return names.dayShort[date.getDay()];
        case 'DD':
          return names.dayLong[date.getDay()];
        case 'm':
          return String(date.getMonth() + 1);
        case 'mm':
          return pad(date.getMonth() + 1, 2);
        case 'M':
          return names.monthShort[date.getMonth()];
        case 'MM':
          return names.monthLong[date.getMonth()];
        case 'y':
          return pad(date.getFullYear() % 100, 2);
        case 'yy':
          return String(date.getFullYear());
        case '@':
          return String(date.getTime());
        case '!':
          return String(date.getTime() * 10_000 + TICKS_TO_EPOCH);
      }
    })
    .join('');
}

/**
 * Lee una fecha escrita con el formato indicado. Devuelve `null` si el texto no
 * encaja o la fecha no existe (31 de febrero). Los años de dos dígitos se
 * interpretan como 19xx o 20xx según `shortYearCutoff` años por delante de hoy.
 */
export function parseDate(text: string, format: string, names: CbDateNames, shortYearCutoff = 10): Date | null {
  const value = text.trim();
  if (!value) return null;
  let pos = 0;
  let year = -1;
  let month = -1;
  let day = -1;
  let doy = -1;
  let literalDate: Date | null = null;

  const digits = (min: number, max: number): number | null => {
    const match = new RegExp(`^\\d{${min},${max}}`).exec(value.slice(pos));
    if (!match) return null;
    pos += match[0].length;
    return Number(match[0]);
  };
  const name = (list: string[]): number | null => {
    // El nombre más largo primero, para que "mar" no gane a "marzo".
    const rest = value.slice(pos).toLocaleLowerCase();
    const ordered = list.map((n, i) => ({ n: n.toLocaleLowerCase(), i })).sort((a, b) => b.n.length - a.n.length);
    const hit = ordered.find((o) => o.n && rest.startsWith(o.n));
    if (!hit) return null;
    pos += hit.n.length;
    return hit.i;
  };

  for (const t of tokenize(format)) {
    let n: number | null;
    switch (t.kind) {
      case 'literal':
        if (value.slice(pos, pos + t.text.length).toLocaleLowerCase() !== t.text.toLocaleLowerCase()) return null;
        pos += t.text.length;
        continue;
      case 'd':
      case 'dd':
        n = digits(t.kind === 'dd' ? 2 : 1, 2);
        if (n === null) return null;
        day = n;
        continue;
      case 'o':
      case 'oo':
        n = digits(t.kind === 'oo' ? 3 : 1, 3);
        if (n === null) return null;
        doy = n;
        continue;
      case 'D':
      case 'DD':
        if (name(t.kind === 'DD' ? names.dayLong : names.dayShort) === null) return null;
        continue;
      case 'm':
      case 'mm':
        n = digits(t.kind === 'mm' ? 2 : 1, 2);
        if (n === null) return null;
        month = n;
        continue;
      case 'M':
      case 'MM':
        n = name(t.kind === 'MM' ? names.monthLong : names.monthShort);
        if (n === null) return null;
        month = n + 1;
        continue;
      case 'y':
      case 'yy':
        n = digits(t.kind === 'yy' ? 4 : 2, t.kind === 'yy' ? 4 : 2);
        if (n === null) return null;
        if (t.kind === 'y') {
          const now = new Date().getFullYear();
          const cutoff = (now % 100) + shortYearCutoff;
          n += n <= cutoff ? now - (now % 100) : now - (now % 100) - 100;
        }
        year = n;
        continue;
      case '@':
        n = digits(1, 16);
        if (n === null) return null;
        literalDate = new Date(n);
        continue;
      case '!':
        n = digits(1, 20);
        if (n === null) return null;
        literalDate = new Date((n - TICKS_TO_EPOCH) / 10_000);
        continue;
    }
  }
  if (pos !== value.length) return null;
  if (literalDate) return Number.isNaN(literalDate.getTime()) ? null : literalDate;

  if (year === -1) year = new Date().getFullYear();
  if (doy > -1) {
    const d = new Date(year, 0, doy);
    if (d.getFullYear() !== year) return null;
    return d;
  }
  if (month === -1) month = 1;
  if (day === -1) day = 1;
  const date = new Date(year, month - 1, day);
  // Rechaza fechas que JavaScript "corrige" (31/02 → 03/03).
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

/**
 * Formato numérico del `locale` en la sintaxis de arriba (p. ej. `dd/mm/yy` en
 * es-CO, `mm/dd/yy` en en-US), para escribir fechas cuando no se indica uno.
 */
export function localeDateFormat(locale: string | undefined, view: 'date' | 'month' | 'year'): string {
  if (view === 'year') return 'yy';
  const parts = new Intl.DateTimeFormat(locale, {
    day: view === 'date' ? '2-digit' : undefined,
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date(2023, 10, 22));
  return parts
    .map((p) => {
      if (p.type === 'day') return 'dd';
      if (p.type === 'month') return 'mm';
      if (p.type === 'year') return 'yy';
      // Letras sueltas en un literal (p. ej. "г." en ruso) se escapan.
      return /[a-zA-Z@!']/.test(p.value) ? `'${p.value.replace(/'/g, "''")}'` : p.value;
    })
    .join('');
}
