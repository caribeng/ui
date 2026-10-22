/**
 * Datos de numeración telefónica de un país (plan nacional, ITU-T E.164).
 * El "número nacional" es el que va después del prefijo internacional, sin el
 * 0 (o el dígito) que se marca dentro del país.
 */
export interface CbPhoneCountry {
  /** Código ISO 3166-1 alfa-2 (`CO`). */
  readonly iso: string;
  /** Prefijo internacional sin `+` (`57`). */
  readonly dial: string;
  /** Longitudes válidas del número nacional. */
  readonly lengths: readonly number[];
  /** Formato por longitud con `#` por dígito (`{ 10: '### ### ####' }`). Sin él, grupos de 3. */
  readonly formats?: Readonly<Record<number, string>>;
  /** Dígito que se marca delante dentro del país y se quita al guardar (`0`). */
  readonly trunk?: string;
  /** Comienzos del número nacional para distinguir países que comparten prefijo (+1). */
  readonly leading?: readonly string[];
  /** Ejemplo de número nacional (se usa como placeholder). */
  readonly example?: string;
}

const NANP = { dial: '1', lengths: [10], formats: { 10: '(###) ###-####' } } as const;

/**
 * Países incluidos: América Latina y el Caribe, Norteamérica, la Europa más
 * habitual y los mayores de Asia y Oceanía. Amplíalos con `[countries]`.
 */
export const CB_PHONE_COUNTRIES: readonly CbPhoneCountry[] = [
  // --- América Latina y el Caribe ---
  { iso: 'AR', dial: '54', lengths: [10, 11], formats: { 10: '## ####-####', 11: '# ## ####-####' }, trunk: '0', example: '1123456789' },
  { iso: 'BO', dial: '591', lengths: [8], formats: { 8: '# ### ####' }, trunk: '0', example: '71234567' },
  { iso: 'BR', dial: '55', lengths: [10, 11], formats: { 10: '(##) ####-####', 11: '(##) #####-####' }, trunk: '0', example: '11912345678' },
  { iso: 'CL', dial: '56', lengths: [9], formats: { 9: '# #### ####' }, example: '912345678' },
  { iso: 'CO', dial: '57', lengths: [10], formats: { 10: '### ### ####' }, example: '3001234567' },
  { iso: 'CR', dial: '506', lengths: [8], formats: { 8: '#### ####' }, example: '83123456' },
  { iso: 'CU', dial: '53', lengths: [8], formats: { 8: '# ### ####' }, trunk: '0', example: '51234567' },
  { iso: 'DO', ...NANP, leading: ['809', '829', '849'], example: '8092345678' },
  { iso: 'EC', dial: '593', lengths: [8, 9], formats: { 8: '# ### ####', 9: '## ### ####' }, trunk: '0', example: '991234567' },
  { iso: 'SV', dial: '503', lengths: [8], formats: { 8: '#### ####' }, example: '70123456' },
  { iso: 'GT', dial: '502', lengths: [8], formats: { 8: '#### ####' }, example: '51234567' },
  { iso: 'HN', dial: '504', lengths: [8], formats: { 8: '####-####' }, example: '91234567' },
  { iso: 'MX', dial: '52', lengths: [10], formats: { 10: '## #### ####' }, example: '5512345678' },
  { iso: 'NI', dial: '505', lengths: [8], formats: { 8: '#### ####' }, example: '81234567' },
  { iso: 'PA', dial: '507', lengths: [7, 8], formats: { 7: '###-####', 8: '####-####' }, example: '61234567' },
  { iso: 'PY', dial: '595', lengths: [9], formats: { 9: '### ######' }, trunk: '0', example: '961456789' },
  { iso: 'PE', dial: '51', lengths: [8, 9], formats: { 8: '# ### ####', 9: '### ### ###' }, trunk: '0', example: '912345678' },
  { iso: 'PR', ...NANP, leading: ['787', '939'], example: '7872345678' },
  { iso: 'UY', dial: '598', lengths: [8], formats: { 8: '#### ####' }, trunk: '0', example: '94231234' },
  { iso: 'VE', dial: '58', lengths: [10], formats: { 10: '###-#######' }, trunk: '0', example: '4121234567' },
  { iso: 'JM', ...NANP, leading: ['876', '658'], example: '8762101234' },
  { iso: 'TT', ...NANP, leading: ['868'], example: '8682911234' },
  // --- Norteamérica ---
  { iso: 'US', ...NANP, example: '2015550123' },
  { iso: 'CA', ...NANP, leading: ['204', '226', '236', '249', '250', '263', '289', '306', '343', '354', '365', '367', '368', '382', '403', '416', '418', '428', '431', '437', '438', '450', '468', '474', '506', '514', '519', '548', '579', '581', '584', '587', '604', '613', '639', '647', '672', '683', '705', '709', '742', '753', '778', '780', '782', '807', '819', '825', '867', '873', '879', '902', '905'], example: '5062345678' },
  // --- Europa ---
  { iso: 'DE', dial: '49', lengths: [7, 8, 9, 10, 11], formats: { 10: '### #######', 11: '#### #######' }, trunk: '0', example: '15123456789' },
  { iso: 'AT', dial: '43', lengths: [8, 9, 10, 11, 12], formats: { 10: '### #######', 11: '### ########' }, trunk: '0', example: '6641234567' },
  { iso: 'BE', dial: '32', lengths: [8, 9], formats: { 8: '# ### ## ##', 9: '### ## ## ##' }, trunk: '0', example: '470123456' },
  { iso: 'DK', dial: '45', lengths: [8], formats: { 8: '## ## ## ##' }, example: '32123456' },
  { iso: 'ES', dial: '34', lengths: [9], formats: { 9: '### ## ## ##' }, example: '612345678' },
  { iso: 'FI', dial: '358', lengths: [9, 10], formats: { 9: '## ### ####', 10: '## #### ####' }, trunk: '0', example: '412345678' },
  { iso: 'FR', dial: '33', lengths: [9], formats: { 9: '# ## ## ## ##' }, trunk: '0', example: '612345678' },
  { iso: 'GR', dial: '30', lengths: [10], formats: { 10: '### ### ####' }, example: '6912345678' },
  { iso: 'IE', dial: '353', lengths: [9], formats: { 9: '## ### ####' }, trunk: '0', example: '850123456' },
  { iso: 'IT', dial: '39', lengths: [6, 7, 8, 9, 10, 11], formats: { 9: '### ### ###', 10: '### ### ####' }, example: '3123456789' },
  { iso: 'NL', dial: '31', lengths: [9], formats: { 9: '# ########' }, trunk: '0', example: '612345678' },
  { iso: 'NO', dial: '47', lengths: [8], formats: { 8: '### ## ###' }, example: '40612345' },
  { iso: 'PL', dial: '48', lengths: [9], formats: { 9: '### ### ###' }, example: '512345678' },
  { iso: 'PT', dial: '351', lengths: [9], formats: { 9: '### ### ###' }, example: '912345678' },
  { iso: 'GB', dial: '44', lengths: [10], formats: { 10: '#### ######' }, trunk: '0', example: '7400123456' },
  { iso: 'CH', dial: '41', lengths: [9], formats: { 9: '## ### ## ##' }, trunk: '0', example: '781234567' },
  { iso: 'SE', dial: '46', lengths: [9], formats: { 9: '##-### ## ##' }, trunk: '0', example: '701234567' },
  // --- Asia, Oceanía, África y Oriente Medio ---
  { iso: 'AU', dial: '61', lengths: [9], formats: { 9: '### ### ###' }, trunk: '0', example: '412345678' },
  { iso: 'CN', dial: '86', lengths: [11], formats: { 11: '### #### ####' }, trunk: '0', example: '13123456789' },
  { iso: 'IN', dial: '91', lengths: [10], formats: { 10: '##### #####' }, trunk: '0', example: '8123456789' },
  { iso: 'IL', dial: '972', lengths: [9], formats: { 9: '##-###-####' }, trunk: '0', example: '502345678' },
  { iso: 'JP', dial: '81', lengths: [10], formats: { 10: '##-####-####' }, trunk: '0', example: '9012345678' },
  { iso: 'KR', dial: '82', lengths: [9, 10], formats: { 9: '##-###-####', 10: '##-####-####' }, trunk: '0', example: '1020000000' },
  { iso: 'NZ', dial: '64', lengths: [8, 9, 10], formats: { 8: '## ### ###', 9: '## ### ####', 10: '## #### ####' }, trunk: '0', example: '211234567' },
  { iso: 'AE', dial: '971', lengths: [9], formats: { 9: '## ### ####' }, trunk: '0', example: '501234567' },
  { iso: 'ZA', dial: '27', lengths: [9], formats: { 9: '## ### ####' }, trunk: '0', example: '711234567' },
];

/** Emoji de bandera a partir del código ISO (indicadores regionales). */
export function cbFlagEmoji(iso: string): string {
  return iso.toUpperCase().replace(/[A-Z]/g, (c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Aplica el formato del país al número nacional (solo dígitos), también a medio escribir. */
export function cbFormatNational(country: CbPhoneCountry, digits: string): string {
  if (!digits) return '';
  const lengths = [...country.lengths].sort((a, b) => a - b);
  // El formato de la longitud más cercana por arriba; si se pasa, el de la mayor.
  const target = lengths.find((l) => digits.length <= l) ?? lengths[lengths.length - 1];
  const pattern = country.formats?.[target] ?? '### ### ### ### ###';
  let out = '';
  let d = 0;
  for (const ch of pattern) {
    if (d >= digits.length) break;
    if (ch === '#') out += digits[d++];
    else out += ch;
  }
  // Dígitos que sobran del patrón (número demasiado largo): se añaden tal cual.
  if (d < digits.length) out += (out ? ' ' : '') + digits.slice(d);
  return out.replace(/[\s()-]+$/, '');
}

export interface CbParsedPhone {
  readonly country: CbPhoneCountry | null;
  /** Número nacional (solo dígitos, sin prefijo ni 0 nacional). */
  readonly national: string;
}

/**
 * Interpreta lo escrito o pegado. Con `+` o `00` detecta el país por el prefijo
 * (el más largo que coincide; entre los que comparten prefijo, por el comienzo
 * del número o, si no, el país actual). Sin prefijo, usa `current` y quita su 0 nacional.
 */
export function cbParsePhone(text: string, current: CbPhoneCountry | null, countries: readonly CbPhoneCountry[]): CbParsedPhone {
  const raw = (text ?? '').trim();
  const international = /^(\+|00)/.test(raw);
  let digits = raw.replace(/\D/g, '');
  if (international) {
    if (raw.startsWith('00')) digits = digits.slice(2);
    const candidates = countries
      .filter((c) => digits.startsWith(c.dial))
      .sort((a, b) => b.dial.length - a.dial.length);
    if (!candidates.length) return { country: current, national: digits };
    const dial = candidates[0].dial;
    const national = digits.slice(dial.length);
    const sameDial = candidates.filter((c) => c.dial === dial);
    const byLeading = sameDial.find((c) => c.leading?.some((p) => national.startsWith(p)));
    const country =
      byLeading ??
      (current && current.dial === dial ? current : null) ??
      sameDial.find((c) => !c.leading) ??
      sameDial[0];
    return { country, national: stripTrunk(country, national) };
  }
  return { country: current, national: current ? stripTrunk(current, digits) : digits };
}

function stripTrunk(country: CbPhoneCountry, digits: string): string {
  return country.trunk && digits.startsWith(country.trunk) ? digits.slice(country.trunk.length) : digits;
}

/** Número completo en formato E.164 (`+573001234567`), o `''` sin dígitos. */
export function cbToE164(country: CbPhoneCountry | null, national: string): string {
  if (!national) return '';
  return country ? `+${country.dial}${national}` : `+${national}`;
}

/** Si la longitud del número nacional es válida para el país. */
export function cbIsValidPhone(country: CbPhoneCountry | null, national: string): boolean {
  return !!country && country.lengths.includes(national.length) && /^\d+$/.test(national);
}
