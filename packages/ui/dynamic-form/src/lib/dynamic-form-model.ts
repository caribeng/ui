import { Validators, type AbstractControl, type ValidationErrors, type ValidatorFn } from '@angular/forms';

/** Tipo de campo (y control de CaribeNG que lo pinta). Un nombre propio usa la plantilla `cbFormField` con ese nombre. */
export type CbFormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'tel'
  | 'url'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  | 'date'
  | 'slider'
  | 'rating'
  | 'chips'
  | 'color'
  | 'buttons'
  | 'mask'
  /** Grupo de campos (objeto anidado) o, con `repeatable`, lista de grupos. */
  | 'group'
  /** Elementos de diseño (sin valor). */
  | 'heading'
  | 'paragraph'
  | 'divider'
  | (string & {});

/** Texto fijo o traducido por idioma (`{ es: 'Nombre', en: 'Name' }`). */
export type CbFormText = string | Readonly<Record<string, string>>;

/** Dónde va la etiqueta respecto al control. */
export type CbFormLabelPosition = 'top' | 'left' | 'right' | 'floating' | 'hidden';

/** Tamaño de los controles. */
export type CbFormSize = 'sm' | 'md' | 'lg';

/**
 * Valor que cambia con el ancho del formulario: `base` (móvil), `sm` (≥ 30rem),
 * `md` (≥ 40rem) y `lg` (≥ 60rem). Cada tamaño hereda el anterior.
 */
export type CbFormResponsive<T> = T | { readonly base?: T; readonly sm?: T; readonly md?: T; readonly lg?: T };

/** Opción de `select`, `multiselect`, `radio` y `buttons`. */
export interface CbFormOption {
  readonly label: CbFormText;
  readonly value: unknown;
  readonly disabled?: boolean;
}

/**
 * Condición sobre el valor de otro campo (JSON puro). Con varias propiedades,
 * se deben cumplir todas. También puede ser una función `(valor del formulario) => boolean`.
 */
export interface CbFormConditionRule {
  readonly field: string;
  readonly equals?: unknown;
  readonly notEquals?: unknown;
  readonly in?: readonly unknown[];
  /** `true`: tiene valor (no vacío, no `false`); `false`: está vacío. */
  readonly filled?: boolean;
}
export type CbFormCondition = CbFormConditionRule | readonly CbFormConditionRule[] | ((value: Record<string, unknown>) => boolean);

/** Regla entre campos: compara el valor con el de otro campo. */
export interface CbFormRule {
  readonly equalsField?: string;
  readonly notEqualsField?: string;
  /** Mayor o igual que otro campo (números o fechas). */
  readonly gteField?: string;
  readonly lteField?: string;
  readonly gtField?: string;
  readonly ltField?: string;
  readonly message?: CbFormText;
}

/** Mensajes de error propios, por validador. */
export type CbFormMessages = Partial<Record<'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'email' | 'pattern' | 'rule' | string, CbFormText>>;

/** Opciones de la etiqueta (en el formulario, en una sección o en un campo). */
export interface CbFormLabelOptions {
  readonly labelPosition?: CbFormLabelPosition;
  /** Alineación del texto de la etiqueta cuando va a un lado. */
  readonly labelAlign?: 'start' | 'end';
  /** Ancho de la etiqueta cuando va a un lado (`10rem` por defecto). */
  readonly labelWidth?: string;
}

/** Campo del formulario (o elemento de diseño: `heading`, `paragraph`, `divider`). */
export interface CbFormField extends CbFormLabelOptions {
  /** Propiedad del valor (obligatoria salvo en los elementos de diseño). */
  readonly key?: string;
  readonly type?: CbFormFieldType;
  readonly label?: CbFormText;
  readonly placeholder?: CbFormText;
  /** Texto de ayuda bajo el campo. */
  readonly hint?: CbFormText;
  /** Contenido de `heading` y `paragraph`. */
  readonly content?: CbFormText;
  /** Valor inicial (en `date`, `Date` o texto `AAAA-MM-DD`; en un grupo repetible, lista de objetos). */
  readonly default?: unknown;
  readonly required?: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly minLength?: number;
  readonly maxLength?: number;
  /** Expresión regular (texto) que debe cumplir el valor completo. */
  readonly pattern?: string;
  readonly options?: readonly CbFormOption[];
  /** Opciones según el valor de otro campo: `{ field: 'pais', map: { CO: [...], PA: [...] } }`. */
  readonly optionsFrom?: { readonly field: string; readonly map: Readonly<Record<string, readonly CbFormOption[]>> };
  /** Nombre de un cargador de `loaders` (opciones de una API); se vuelve a llamar al cambiar `dependsOn`. */
  readonly optionsLoader?: string;
  readonly dependsOn?: readonly string[];
  /** Fórmula de un campo calculado: `cantidad * precio`, `round(total * 0.19, 0)`, `sum(lineas.subtotal)`. */
  readonly formula?: string;
  /** Cálculo desde código (en vez de `formula`). */
  readonly compute?: (value: Record<string, unknown>) => unknown;
  /** Máscara de un campo `mask` (`9` dígito, `a` letra, `*` cualquiera): `999-9999`. */
  readonly mask?: string;
  /** Texto o símbolo antes y después del control (`$`, `%`, `kg`). */
  readonly prefix?: CbFormText;
  readonly suffix?: CbFormText;
  /** Icono antes del control. */
  readonly icon?: string;
  /** Filas de un `textarea`. */
  readonly rows?: number;
  /** Columnas que ocupa (número o `full`), también por tamaño de pantalla. */
  readonly colSpan?: CbFormResponsive<number | 'full'>;
  /** Empieza una fila nueva. */
  readonly newRow?: boolean;
  /** Orden dentro de su sección (por defecto, el del esquema). */
  readonly order?: number;
  readonly size?: CbFormSize;
  readonly disabled?: boolean;
  readonly readonly?: boolean;
  /** Solo se muestra (y se valida y se envía) si se cumple. */
  readonly visibleWhen?: CbFormCondition;
  /** Es obligatorio solo si se cumple. */
  readonly requiredWhen?: CbFormCondition;
  /** Se deshabilita si se cumple. */
  readonly disabledWhen?: CbFormCondition;
  /** Reglas entre campos (confirmar contraseña, fecha fin ≥ inicio). */
  readonly rules?: readonly CbFormRule[];
  /** Mensajes de error propios. */
  readonly messages?: CbFormMessages;
  /** Validadores extra (solo desde código). La clave del error elige el mensaje en `messages`. */
  readonly validators?: readonly ValidatorFn[];
  /** `radio`: disposición de las opciones. */
  readonly orientation?: 'vertical' | 'horizontal';
  /** `group`: sus campos. */
  readonly fields?: readonly CbFormField[];
  /** `group`: lista de grupos que se añaden y quitan. */
  readonly repeatable?: boolean;
  readonly minItems?: number;
  readonly maxItems?: number;
  /** Texto del botón de añadir (`Añadir contacto`). */
  readonly addLabel?: CbFormText;
  /** Título de cada elemento; `{n}` es su número (`Contacto {n}`). */
  readonly itemLabel?: CbFormText;
  /** Columnas dentro del grupo. */
  readonly columns?: CbFormResponsive<number>;
}

/** Sección: un grupo de campos con título y sus propias columnas y etiquetas. */
export interface CbFormSection extends CbFormLabelOptions {
  readonly title?: CbFormText;
  readonly description?: CbFormText;
  readonly columns?: CbFormResponsive<number>;
  readonly size?: CbFormSize;
  readonly fields: readonly CbFormField[];
  readonly visibleWhen?: CbFormCondition;
}

/** Paso de un formulario por pasos. */
export interface CbFormStep {
  readonly title: CbFormText;
  readonly description?: CbFormText;
  readonly fields?: readonly CbFormField[];
  readonly sections?: readonly CbFormSection[];
}

/** Disposición de etiqueta y campo (atajo de `labelPosition`). */
export type CbFormLayout = 'vertical' | 'horizontal';

/** Esquema completo. */
export interface CbFormSchema extends CbFormLabelOptions {
  /** Campos sueltos (o usa `sections`, o `steps`). */
  readonly fields?: readonly CbFormField[];
  readonly sections?: readonly CbFormSection[];
  /** Formulario por pasos (asistente): cada paso valida sus campos antes de seguir. */
  readonly steps?: readonly CbFormStep[];
  /** Columnas de la rejilla (1 por defecto), también por tamaño de pantalla. */
  readonly columns?: CbFormResponsive<number>;
  /** `vertical`: etiqueta encima; `horizontal`: a la izquierda. `labelPosition` lo precisa. */
  readonly layout?: CbFormLayout;
  readonly size?: CbFormSize;
  readonly submitLabel?: CbFormText;
  /** Texto del botón de restablecer; sin él no se muestra. */
  readonly resetLabel?: CbFormText;
  readonly nextLabel?: CbFormText;
  readonly backLabel?: CbFormText;
}

/** Tipos que son solo diseño (no tienen valor). */
export const LAYOUT_TYPES: ReadonlySet<string> = new Set(['heading', 'paragraph', 'divider']);

export function isLayout(field: CbFormField): boolean {
  return LAYOUT_TYPES.has(field.type ?? '');
}

/** Pasos del esquema (sin `steps`, un único paso con todo). */
export function stepsOf(schema: CbFormSchema): readonly CbFormStep[] {
  if (schema.steps?.length) return schema.steps;
  return [{ title: '', fields: schema.fields, sections: schema.sections }];
}

/** Secciones de un paso (los campos sueltos forman una sección sin título), con los campos en su orden. */
export function sectionsOf(step: CbFormStep | CbFormSchema): readonly CbFormSection[] {
  const out: CbFormSection[] = [];
  if (step.fields?.length) out.push({ fields: step.fields });
  return [...out, ...(step.sections ?? [])].map((s) => ({ ...s, fields: ordered(s.fields) }));
}

/** Campos ordenados por `order` (los que no lo tienen, en su posición). */
export function ordered(fields: readonly CbFormField[]): CbFormField[] {
  return fields
    .map((f, i) => ({ f, i }))
    .sort((a, b) => (a.f.order ?? a.i) - (b.f.order ?? b.i) || a.i - b.i)
    .map((x) => x.f);
}

/** Todos los campos de valor del primer nivel del esquema (en todos los pasos). */
export function fieldsOf(schema: CbFormSchema): CbFormField[] {
  return stepsOf(schema)
    .flatMap((s) => sectionsOf(s))
    .flatMap((s) => s.fields)
    .filter((f) => !isLayout(f) && !!f.key);
}

/** Valor responsive resuelto en los cuatro tamaños (cada uno hereda el anterior). */
export function responsive<T>(value: CbFormResponsive<T> | undefined, fallback: T): { base: T; sm: T; md: T; lg: T } {
  if (value === undefined || value === null) return { base: fallback, sm: fallback, md: fallback, lg: fallback };
  if (typeof value !== 'object') return { base: value as T, sm: value as T, md: value as T, lg: value as T };
  const v = value as { base?: T; sm?: T; md?: T; lg?: T };
  const base = v.base ?? fallback;
  const sm = v.sm ?? base;
  const md = v.md ?? sm;
  const lg = v.lg ?? md;
  return { base, sm, md, lg };
}

export function isFilled(value: unknown): boolean {
  if (value === null || value === undefined || value === '' || value === false) return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function sameValue(a: unknown, b: unknown): boolean {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  return a === b;
}

/** Evalúa una condición contra el valor actual del formulario. */
export function matches(condition: CbFormCondition | undefined, value: Record<string, unknown>): boolean {
  if (!condition) return true;
  if (typeof condition === 'function') return condition(value);
  const rules: readonly CbFormConditionRule[] = Array.isArray(condition) ? condition : [condition as CbFormConditionRule];
  return rules.every((rule) => {
    const v = value[rule.field];
    if ('equals' in rule && !(Array.isArray(v) ? v.includes(rule.equals) : sameValue(v, rule.equals))) return false;
    if ('notEquals' in rule && sameValue(v, rule.notEquals)) return false;
    if (rule.in && !rule.in.some((x) => sameValue(x, v))) return false;
    if (rule.filled !== undefined && isFilled(v) !== rule.filled) return false;
    return true;
  });
}

/** Valor inicial de un campo, convertido al tipo de su control. */
export function initialValue(field: CbFormField): unknown {
  const v = field.default;
  switch (field.type ?? 'text') {
    case 'checkbox':
    case 'toggle':
      return !!v;
    case 'multiselect':
    case 'chips':
      return Array.isArray(v) ? [...v] : [];
    case 'number':
    case 'slider':
    case 'rating':
      return typeof v === 'number' ? v : field.type === 'number' ? null : (field.min ?? 0);
    case 'date': {
      if (v instanceof Date) return v;
      const m = typeof v === 'string' ? /^(\d{4})-(\d{2})-(\d{2})/.exec(v) : null;
      return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
    }
    case 'select':
    case 'radio':
    case 'buttons':
      return v ?? null;
    case 'color':
      return typeof v === 'string' ? v : '#2563eb';
    default:
      return typeof v === 'string' ? v : v == null ? '' : v;
  }
}

/** Obligatorio que entiende casillas (`true`) y listas (al menos un elemento). */
const requiredValidator: ValidatorFn = (c: AbstractControl): ValidationErrors | null => (isFilled(c.value) ? null : { required: true });

/** Validadores de un campo según su esquema (`required` aparte, porque puede ser condicional). */
export function validatorsOf(field: CbFormField, required: boolean): ValidatorFn[] {
  const v: ValidatorFn[] = [];
  if (required) v.push(requiredValidator);
  const type = field.type ?? 'text';
  if (field.min !== undefined && (type === 'number' || type === 'slider')) v.push(Validators.min(field.min));
  if (field.max !== undefined && (type === 'number' || type === 'slider')) v.push(Validators.max(field.max));
  if (field.minLength !== undefined) v.push(Validators.minLength(field.minLength));
  if (field.maxLength !== undefined) v.push(Validators.maxLength(field.maxLength));
  if (type === 'email') v.push(Validators.email);
  if (type === 'url') v.push(Validators.pattern(/^https?:\/\/\S+\.\S+$/));
  if (field.pattern) v.push(Validators.pattern(field.pattern));
  if (field.validators) v.push(...field.validators);
  return v;
}

/** Comparable de una regla (fecha → tiempo, texto numérico → número). */
function comparable(v: unknown): number | string | null {
  if (v === null || v === undefined || v === '') return null;
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) && String(v).trim() !== '' ? n : String(v);
}

/** Error de la primera regla entre campos que no se cumple (o `null`). */
export function checkRules(rules: readonly CbFormRule[] | undefined, value: unknown, scope: Record<string, unknown>): CbFormRule | null {
  if (!rules?.length || !isFilled(value)) return null;
  const a = comparable(value);
  for (const r of rules) {
    const other = (k: string | undefined) => (k ? comparable(scope[k]) : null);
    if (r.equalsField && !sameValue(value, scope[r.equalsField]) && a !== other(r.equalsField)) return r;
    if (r.notEqualsField && (sameValue(value, scope[r.notEqualsField]) || a === other(r.notEqualsField))) return r;
    const cmp = (k: string | undefined, ok: (x: number | string, y: number | string) => boolean) => {
      const b = other(k);
      return k && a !== null && b !== null && !ok(a, b);
    };
    if (cmp(r.gteField, (x, y) => x >= y)) return r;
    if (cmp(r.lteField, (x, y) => x <= y)) return r;
    if (cmp(r.gtField, (x, y) => x > y)) return r;
    if (cmp(r.ltField, (x, y) => x < y)) return r;
  }
  return null;
}

/** Textos de error por defecto (vienen de la traducción activa). */
export interface FormTexts {
  readonly required: string;
  readonly min: string;
  readonly max: string;
  readonly minLength: string;
  readonly maxLength: string;
  readonly email: string;
  readonly pattern: string;
  readonly invalid: string;
}

/** Mensaje del primer error de un control (`tr` traduce los textos del esquema). */
export function errorMessage(field: CbFormField, errors: ValidationErrors | null, texts: FormTexts, tr: (t: CbFormText | undefined) => string = (t) => (typeof t === 'string' ? t : '')): string | null {
  if (!errors) return null;
  const key = Object.keys(errors)[0];
  const custom = field.messages?.[key];
  if (custom) return tr(custom);
  const e = errors[key];
  switch (key) {
    case 'required':
      return texts.required;
    case 'min':
      return texts.min.replace('{0}', String(e.min));
    case 'max':
      return texts.max.replace('{0}', String(e.max));
    case 'minlength':
      return field.messages?.['minLength'] ? tr(field.messages['minLength']) : texts.minLength.replace('{0}', String(e.requiredLength));
    case 'maxlength':
      return field.messages?.['maxLength'] ? tr(field.messages['maxLength']) : texts.maxLength.replace('{0}', String(e.requiredLength));
    case 'email':
      return texts.email;
    case 'pattern':
      return texts.pattern;
    case 'rule':
      return typeof e === 'string' ? e : texts.invalid;
    default:
      return typeof e === 'string' ? e : texts.invalid;
  }
}

// --- Fórmulas ----------------------------------------------------------------------------

type Token = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string };

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      i++;
    } else if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      out.push({ t: 'num', v: Number(src.slice(i, j)) });
      i = j;
    } else if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_.]/.test(src[j])) j++;
      out.push({ t: 'id', v: src.slice(i, j) });
      i = j;
    } else if ('+-*/(),'.includes(ch)) {
      out.push({ t: 'op', v: ch });
      i++;
    } else throw new Error(`Carácter no válido en la fórmula: ${ch}`);
  }
  return out;
}

function num(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (v instanceof Date) return v.getTime();
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Valor de un identificador (`precio`, `lineas.subtotal` → lista). */
function lookup(name: string, scope: Record<string, unknown>): unknown {
  const [head, ...rest] = name.split('.');
  let v: unknown = scope[head];
  for (const part of rest) {
    v = Array.isArray(v) ? v.map((x) => (x as Record<string, unknown>)?.[part]) : (v as Record<string, unknown> | undefined)?.[part];
  }
  return v;
}

const FUNCS: Record<string, (args: unknown[]) => number> = {
  round: ([x, d]) => {
    const f = 10 ** num(d ?? 0);
    return Math.round(num(x) * f) / f;
  },
  floor: ([x]) => Math.floor(num(x)),
  ceil: ([x]) => Math.ceil(num(x)),
  abs: ([x]) => Math.abs(num(x)),
  min: (args) => Math.min(...args.flatMap((a) => (Array.isArray(a) ? a.map(num) : [num(a)]))),
  max: (args) => Math.max(...args.flatMap((a) => (Array.isArray(a) ? a.map(num) : [num(a)]))),
  sum: (args) => args.flatMap((a) => (Array.isArray(a) ? a.map(num) : [num(a)])).reduce((s, x) => s + x, 0),
  count: (args) => args.flatMap((a) => (Array.isArray(a) ? a : [a])).filter(isFilled).length,
};

/**
 * Evalúa una fórmula aritmética de forma segura (sin `eval`): números, campos,
 * `+ - * /`, paréntesis y las funciones `round`, `floor`, `ceil`, `abs`, `min`,
 * `max`, `sum` y `count` (estas tres aceptan listas: `sum(lineas.subtotal)`).
 */
export function evaluateFormula(formula: string, scope: Record<string, unknown>): number {
  const tokens = tokenize(formula);
  let pos = 0;
  const peek = () => tokens[pos];
  const take = (v?: string) => {
    const tk = tokens[pos++];
    if (!tk || (v !== undefined && (tk.t !== 'op' || tk.v !== v))) throw new Error(`Fórmula no válida: ${formula}`);
    return tk;
  };
  const expr = (): unknown => {
    let left = term();
    while (peek()?.t === 'op' && (peek()!.v === '+' || peek()!.v === '-')) {
      const op = take().v;
      const right = term();
      left = op === '+' ? num(left) + num(right) : num(left) - num(right);
    }
    return left;
  };
  const term = (): unknown => {
    let left = factor();
    while (peek()?.t === 'op' && (peek()!.v === '*' || peek()!.v === '/')) {
      const op = take().v;
      const right = factor();
      left = op === '*' ? num(left) * num(right) : num(right) === 0 ? 0 : num(left) / num(right);
    }
    return left;
  };
  const factor = (): unknown => {
    const tk = take();
    if (tk.t === 'num') return tk.v;
    if (tk.t === 'op' && tk.v === '-') return -num(factor());
    if (tk.t === 'op' && tk.v === '(') {
      const v = expr();
      take(')');
      return v;
    }
    if (tk.t === 'id') {
      if (peek()?.t === 'op' && peek()!.v === '(') {
        const fn = FUNCS[tk.v.toLowerCase()];
        if (!fn) throw new Error(`Función desconocida: ${tk.v}`);
        take('(');
        const args: unknown[] = [];
        if (!(peek()?.t === 'op' && peek()!.v === ')')) {
          args.push(expr());
          while (peek()?.t === 'op' && peek()!.v === ',') {
            take(',');
            args.push(expr());
          }
        }
        take(')');
        return fn(args);
      }
      return lookup(tk.v, scope);
    }
    throw new Error(`Fórmula no válida: ${formula}`);
  };
  const result = expr();
  if (pos < tokens.length) throw new Error(`Fórmula no válida: ${formula}`);
  return Math.round(num(result) * 1e8) / 1e8;
}
