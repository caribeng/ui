/** Estilo del importe en letras. */
export type CbWordsStyle = 'check' | 'text';

/** Opciones de `cbAmountInWords()`. */
export interface CbWordsOptions {
  /** `es` (por defecto) o `en`. */
  readonly language?: 'es' | 'en';
  /** Código de moneda (`COP` por defecto): da el nombre en singular y plural. */
  readonly currency?: string;
  /**
   * `check`: mayúsculas, centavos como `56/100` y `M/CTE` (pesos colombianos), como
   * en un cheque. `text`: minúsculas y centavos en letras.
   */
  readonly style?: CbWordsStyle;
}

interface CurrencyName {
  readonly one: string;
  readonly many: string;
  readonly cent: string;
  readonly cents: string;
  /** Femenino en español («una libra»). */
  readonly feminine?: boolean;
  readonly suffix?: string;
}

const ES_CURRENCIES: Record<string, CurrencyName> = {
  COP: { one: 'peso', many: 'pesos', cent: 'centavo', cents: 'centavos', suffix: 'M/CTE' },
  MXN: { one: 'peso', many: 'pesos', cent: 'centavo', cents: 'centavos', suffix: 'M.N.' },
  CLP: { one: 'peso', many: 'pesos', cent: 'centavo', cents: 'centavos' },
  ARS: { one: 'peso', many: 'pesos', cent: 'centavo', cents: 'centavos' },
  DOP: { one: 'peso', many: 'pesos', cent: 'centavo', cents: 'centavos' },
  USD: { one: 'dólar', many: 'dólares', cent: 'centavo', cents: 'centavos' },
  EUR: { one: 'euro', many: 'euros', cent: 'céntimo', cents: 'céntimos' },
  PEN: { one: 'sol', many: 'soles', cent: 'céntimo', cents: 'céntimos' },
  GBP: { one: 'libra', many: 'libras', cent: 'penique', cents: 'peniques', feminine: true },
};

const EN_CURRENCIES: Record<string, CurrencyName> = {
  COP: { one: 'peso', many: 'pesos', cent: 'cent', cents: 'cents' },
  MXN: { one: 'peso', many: 'pesos', cent: 'cent', cents: 'cents' },
  USD: { one: 'dollar', many: 'dollars', cent: 'cent', cents: 'cents' },
  EUR: { one: 'euro', many: 'euros', cent: 'cent', cents: 'cents' },
  GBP: { one: 'pound', many: 'pounds', cent: 'penny', cents: 'pence' },
};

const UNITS = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const HUNDREDS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

/** 0–999 en español; `apocope` acorta «uno» a «un» (antes de un sustantivo o de «mil»). */
function esHundreds(n: number, apocope: boolean, feminine = false): string {
  if (n === 0) return '';
  if (n === 100) return 'cien';
  const h = Math.floor(n / 100);
  const rest = n % 100;
  let hundreds = HUNDREDS[h];
  if (feminine && h > 1) hundreds = hundreds.replace(/ientos$/, 'ientas').replace(/^quinientos$/, 'quinientas');
  let tail = '';
  if (rest < 30) tail = UNITS[rest];
  else {
    const t = Math.floor(rest / 10);
    const u = rest % 10;
    tail = TENS[t] + (u ? ` y ${UNITS[u]}` : '');
  }
  if (tail.endsWith('uno') && apocope) tail = feminine ? tail.replace(/uno$/, 'una') : tail.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un');
  return [hundreds, tail].filter(Boolean).join(' ');
}

/** Entero en letras en español (hasta billones). */
export function esInteger(n: number, apocope = false, feminine = false): string {
  if (n === 0) return 'cero';
  const parts: string[] = [];
  const billions = Math.floor(n / 1e12);
  const millions = Math.floor((n % 1e12) / 1e6);
  const thousands = Math.floor((n % 1e6) / 1e3);
  const units = n % 1e3;
  if (billions) parts.push(billions === 1 ? 'un billón' : `${esInteger(billions, true)} billones`);
  if (millions) parts.push(millions === 1 ? 'un millón' : `${esInteger(millions, true)} millones`);
  if (thousands) parts.push(thousands === 1 ? 'mil' : `${esHundreds(thousands, true, feminine)} mil`);
  if (units) parts.push(esHundreds(units, apocope, feminine));
  return parts.join(' ');
}

const EN_SMALL = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function enHundreds(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const tail = rest < 20 ? EN_SMALL[rest] : EN_TENS[Math.floor(rest / 10)] + (rest % 10 ? `-${EN_SMALL[rest % 10]}` : '');
  return [h ? `${EN_SMALL[h]} hundred` : '', tail].filter(Boolean).join(' ');
}

/** Entero en letras en inglés (hasta trillones). */
export function enInteger(n: number): string {
  if (n === 0) return 'zero';
  const scales: [number, string][] = [
    [1e12, 'trillion'],
    [1e9, 'billion'],
    [1e6, 'million'],
    [1e3, 'thousand'],
  ];
  const parts: string[] = [];
  let rest = n;
  for (const [size, name] of scales) {
    const q = Math.floor(rest / size);
    if (q) parts.push(`${enHundreds(q)} ${name}`);
    rest %= size;
  }
  if (rest) parts.push(enHundreds(rest));
  return parts.join(' ');
}

/**
 * Importe en letras para cheques, recibos y facturas.
 *
 * ```ts
 * cbAmountInWords(1250000.5);                       // "UN MILLÓN DOSCIENTOS CINCUENTA MIL PESOS CON 50/100 M/CTE"
 * cbAmountInWords(21, { style: 'text' });           // "veintiún pesos"
 * cbAmountInWords(1234.56, { language: 'en', currency: 'USD', style: 'text' }); // "one thousand two hundred thirty-four dollars and fifty-six cents"
 * ```
 */
export function cbAmountInWords(value: number, options: CbWordsOptions = {}): string {
  const language = options.language ?? 'es';
  const code = (options.currency ?? 'COP').toUpperCase();
  const style = options.style ?? 'check';
  const negative = value < 0;
  const totalCents = Math.round(Math.abs(value) * 100);
  const integer = Math.floor(totalCents / 100);
  const cents = totalCents % 100;
  let out: string;
  if (language === 'en') {
    const cur = EN_CURRENCIES[code] ?? { one: code, many: code, cent: 'cent', cents: 'cents' };
    out = `${enInteger(integer)} ${integer === 1 ? cur.one : cur.many}`;
    if (cents) out += style === 'check' ? ` and ${String(cents).padStart(2, '0')}/100` : ` and ${enInteger(cents)} ${cents === 1 ? cur.cent : cur.cents}`;
    if (negative) out = `minus ${out}`;
  } else {
    const cur = ES_CURRENCIES[code] ?? { one: code, many: code, cent: 'centavo', cents: 'centavos' };
    const words = esInteger(integer, true, cur.feminine);
    // «un millón de pesos», «dos millones de pesos»: con millones exactos se añade «de».
    const de = integer > 0 && integer % 1e6 === 0 ? ' de' : '';
    out = `${words}${de} ${integer === 1 ? cur.one : cur.many}`;
    if (cents) out += style === 'check' ? ` con ${String(cents).padStart(2, '0')}/100` : ` con ${esInteger(cents, true)} ${cents === 1 ? cur.cent : cur.cents}`;
    if (style === 'check' && cur.suffix) out += ` ${cur.suffix}`;
    if (negative) out = `menos ${out}`;
  }
  return style === 'check' ? out.toLocaleUpperCase(language) : out;
}
