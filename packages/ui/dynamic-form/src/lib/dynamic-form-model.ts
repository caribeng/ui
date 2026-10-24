import { Validators, type AbstractControl, type ValidationErrors, type ValidatorFn } from '@angular/forms';

/** Tipo de campo (y control de CaribeNG que lo pinta). */
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
  | 'buttons';

/** Opción de `select`, `multiselect`, `radio` y `buttons`. */
export interface CbFormOption {
  readonly label: string;
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

/** Mensajes de error propios, por validador. */
export type CbFormMessages = Partial<Record<'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'email' | 'pattern' | string, string>>;

/** Campo del formulario. */
export interface CbFormField {
  /** Propiedad del valor del formulario. */
  readonly key: string;
  readonly type?: CbFormFieldType;
  readonly label?: string;
  readonly placeholder?: string;
  /** Texto de ayuda bajo el campo. */
  readonly hint?: string;
  /** Valor inicial (en `date`, `Date` o texto `AAAA-MM-DD`). */
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
  /** Filas de un `textarea`. */
  readonly rows?: number;
  /** Columnas que ocupa en la rejilla, o `full` para toda la fila. */
  readonly colSpan?: number | 'full';
  readonly disabled?: boolean;
  readonly readonly?: boolean;
  /** Solo se muestra (y se valida y se envía) si se cumple. */
  readonly visibleWhen?: CbFormCondition;
  /** Es obligatorio solo si se cumple. */
  readonly requiredWhen?: CbFormCondition;
  /** Se deshabilita si se cumple. */
  readonly disabledWhen?: CbFormCondition;
  /** Mensajes de error propios. */
  readonly messages?: CbFormMessages;
  /** Validadores extra (solo desde código). La clave del error elige el mensaje en `messages`. */
  readonly validators?: readonly ValidatorFn[];
  /** `radio`: disposición de las opciones. */
  readonly orientation?: 'vertical' | 'horizontal';
}

/** Sección: un grupo de campos con título y sus propias columnas. */
export interface CbFormSection {
  readonly title?: string;
  readonly description?: string;
  /** Columnas de esta sección (si no, las del formulario). */
  readonly columns?: number;
  readonly fields: readonly CbFormField[];
  readonly visibleWhen?: CbFormCondition;
}

/** Disposición de etiqueta y campo. */
export type CbFormLayout = 'vertical' | 'horizontal';

/** Esquema completo. */
export interface CbFormSchema {
  /** Campos sueltos (o usa `sections`). */
  readonly fields?: readonly CbFormField[];
  readonly sections?: readonly CbFormSection[];
  /** Columnas de la rejilla (1 por defecto). */
  readonly columns?: number;
  /** `vertical`: etiqueta encima; `horizontal`: etiqueta a la izquierda. */
  readonly layout?: CbFormLayout;
  /** Ancho de la etiqueta en `horizontal` (`10rem` por defecto). */
  readonly labelWidth?: string;
  readonly submitLabel?: string;
  /** Texto del botón de restablecer; sin él no se muestra. */
  readonly resetLabel?: string;
}

/** Secciones del esquema (los campos sueltos forman una sección sin título). */
export function sectionsOf(schema: CbFormSchema): readonly CbFormSection[] {
  const out: CbFormSection[] = [];
  if (schema.fields?.length) out.push({ fields: schema.fields });
  return [...out, ...(schema.sections ?? [])];
}

export function fieldsOf(schema: CbFormSchema): CbFormField[] {
  return sectionsOf(schema).flatMap((s) => s.fields);
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
      return typeof v === 'string' ? v : v == null ? '' : String(v);
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

/** Mensaje del primer error de un control. */
export function errorMessage(field: CbFormField, errors: ValidationErrors | null, texts: FormTexts): string | null {
  if (!errors) return null;
  const key = Object.keys(errors)[0];
  const custom = field.messages?.[key];
  if (custom) return custom;
  const e = errors[key];
  switch (key) {
    case 'required':
      return texts.required;
    case 'min':
      return texts.min.replace('{0}', String(e.min));
    case 'max':
      return texts.max.replace('{0}', String(e.max));
    case 'minlength':
      return field.messages?.['minLength'] ?? texts.minLength.replace('{0}', String(e.requiredLength));
    case 'maxlength':
      return field.messages?.['maxLength'] ?? texts.maxLength.replace('{0}', String(e.requiredLength));
    case 'email':
      return texts.email;
    case 'pattern':
      return texts.pattern;
    default:
      return typeof e === 'string' ? e : texts.invalid;
  }
}
