import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { Subscription } from 'rxjs';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';
import { CbCheckbox } from '@caribeng/ui/checkbox';
import { CbChips } from '@caribeng/ui/chips';
import { CbColorPicker } from '@caribeng/ui/colorpicker';
import { CbDatepicker } from '@caribeng/ui/datepicker';
import { CbIcon } from '@caribeng/ui/icon';
import { CbInput } from '@caribeng/ui/input';
import { CbInputNumber } from '@caribeng/ui/input-number';
import { CbMultiSelect } from '@caribeng/ui/multiselect';
import { CbPassword } from '@caribeng/ui/password';
import { CbRadio, CbRadioGroup } from '@caribeng/ui/radio';
import { CbRating } from '@caribeng/ui/rating';
import { CbSelect } from '@caribeng/ui/select';
import { CbSelectButton } from '@caribeng/ui/selectbutton';
import { CbSlider } from '@caribeng/ui/slider';
import { CbTextarea } from '@caribeng/ui/textarea';
import { CbToggle } from '@caribeng/ui/toggle';
import {
  errorMessage,
  fieldsOf,
  initialValue,
  matches,
  sectionsOf,
  validatorsOf,
  type CbFormField,
  type CbFormLayout,
  type CbFormSchema,
  type CbFormSection,
  type FormTexts,
} from './dynamic-form-model';

/** Tipos cuyo control pinta su propia ayuda y error (y los asocia al campo). */
const OWN_MESSAGES = new Set(['text', 'email', 'tel', 'url', 'number', 'textarea', 'date']);
/** Tipos que llevan la etiqueta dentro del control (a la derecha de la casilla). */
const INLINE_LABEL = new Set(['checkbox', 'toggle']);
/** Tipos con un elemento nativo enlazable con `<label for>`. */
const LABELABLE = new Set(['text', 'email', 'tel', 'url', 'password', 'number', 'textarea', 'date']);

let nextUid = 0;

/**
 * Formulario dinámico de CaribeNG: arma el formulario a partir de un esquema JSON.
 *
 * - Campos con tipo (texto, correo, número, lista, opciones, casilla, fecha…),
 *   validación (`required`, `min`, `max`, `minLength`, `maxLength`, `pattern`) y
 *   mensajes propios.
 * - Disposición `vertical` (etiqueta encima) u `horizontal` (etiqueta a la izquierda),
 *   rejilla de `columns` columnas con `colSpan` por campo y secciones con título;
 *   en pantallas estrechas todo pasa a una columna.
 * - Campos condicionales (`visibleWhen`, `requiredWhen`, `disabledWhen`) y resumen
 *   de errores enlazado al enviar.
 *
 * @example
 * ```html
 * <cb-dynamic-form [schema]="esquema" [(value)]="datos" (formSubmit)="guardar($event)" />
 * ```
 */
@Component({
  selector: 'cb-dynamic-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [
    ReactiveFormsModule,
    CbButton,
    CbCheckbox,
    CbChips,
    CbColorPicker,
    CbDatepicker,
    CbIcon,
    CbInput,
    CbInputNumber,
    CbMultiSelect,
    CbPassword,
    CbRadio,
    CbRadioGroup,
    CbRating,
    CbSelect,
    CbSelectButton,
    CbSlider,
    CbTextarea,
    CbToggle,
  ],
  host: {
    class: 'cb-dynamic-form',
    '[class.cb-df--horizontal]': 'layoutValue() === "horizontal"',
    '[style.--cb-df-label-width]': 'labelWidthValue()',
  },
  template: `
    <form class="cb-df__form" [formGroup]="form()" [attr.aria-label]="ariaLabel() || null" novalidate (submit)="onSubmit($event)" (reset)="$event.preventDefault(); reset()">
      @if (summary().length) {
        <div class="cb-df__summary" role="alert" tabindex="-1" [id]="uid + '-summary'">
          <p class="cb-df__summary-title">
            <cb-icon name="circle-alert" [size]="18" aria-hidden="true" />
            {{ summary().length === 1 ? t().dynamicFormSummaryOne : fmt(t().dynamicFormSummary, summary().length) }}
          </p>
          <ul class="cb-df__summary-list">
            @for (item of summary(); track item.key) {
              <li>
                <a [href]="'#' + idOf(item.field)" (click)="$event.preventDefault(); focusField(item.field.key)">{{ item.field.label || item.field.key }}: {{ item.message }}</a>
              </li>
            }
          </ul>
        </div>
      }

      @for (section of sections(); track $index) {
        @if (sectionVisible(section)) {
          <fieldset class="cb-df__section" [class.cb-df__section--titled]="!!section.title">
            @if (section.title) {
              <legend class="cb-df__legend">{{ section.title }}</legend>
            }
            @if (section.description) {
              <p class="cb-df__section-desc">{{ section.description }}</p>
            }
            <div class="cb-df__grid" [style.--cb-df-cols]="section.columns ?? columnsValue()">
              @for (f of section.fields; track f.key) {
                @if (isVisible(f)) {
                  <div class="cb-df__field" [attr.data-key]="f.key" [style.grid-column]="spanOf(f, section.columns ?? columnsValue())" [class.cb-df__field--inline]="isInline(f)">
                    @if (isInline(f)) {
                      <span class="cb-df__label cb-df__label--empty" aria-hidden="true"></span>
                    } @else if (isLabelable(f)) {
                      <label class="cb-df__label" [attr.for]="idOf(f)" [id]="idOf(f) + '-label'">
                        {{ f.label }}
                        @if (isRequired(f)) {
                          <span class="cb-df__req" aria-hidden="true">*</span>
                        }
                      </label>
                    } @else {
                      <span class="cb-df__label" [id]="idOf(f) + '-label'">
                        {{ f.label }}
                        @if (isRequired(f)) {
                          <span class="cb-df__req" aria-hidden="true">*</span>
                        }
                      </span>
                    }
                    <div class="cb-df__control">
                      @switch (f.type ?? 'text') {
                        @case ('textarea') {
                          <cb-textarea [formControlName]="f.key" [inputId]="idOf(f)" [placeholder]="f.placeholder ?? ''" [rows]="f.rows ?? 3" [maxlength]="f.maxLength ?? null" [readonly]="!!f.readonly" [hint]="f.hint ?? ''" [error]="errorOf(f) ?? ''" />
                        }
                        @case ('number') {
                          <cb-input-number [formControlName]="f.key" [inputId]="idOf(f)" [placeholder]="f.placeholder ?? ''" [min]="f.min ?? null" [max]="f.max ?? null" [step]="f.step ?? 1" [hint]="f.hint ?? ''" [error]="errorOf(f) ?? ''" />
                        }
                        @case ('date') {
                          <cb-datepicker [formControlName]="f.key" [inputId]="idOf(f)" [placeholder]="f.placeholder ?? ''" [hint]="f.hint ?? ''" [error]="errorOf(f) ?? ''" />
                        }
                        @case ('password') {
                          <cb-password [formControlName]="f.key" [inputId]="idOf(f)" [placeholder]="f.placeholder ?? ''" [feedback]="false" />
                        }
                        @case ('select') {
                          <cb-select [formControlName]="f.key" [inputId]="idOf(f)" [ariaLabelledBy]="idOf(f) + '-label'" [options]="f.options ?? []" optionValue="value" [placeholder]="f.placeholder ?? t().select" />
                        }
                        @case ('multiselect') {
                          <cb-multiselect [formControlName]="f.key" [inputId]="idOf(f)" [ariaLabelledBy]="idOf(f) + '-label'" [options]="f.options ?? []" optionValue="value" [placeholder]="f.placeholder ?? t().select" />
                        }
                        @case ('radio') {
                          <cb-radio-group [formControlName]="f.key" [ariaLabel]="f.label ?? f.key" [orientation]="f.orientation ?? 'vertical'">
                            @for (o of f.options ?? []; track $index) {
                              <cb-radio [value]="o.value" [label]="o.label" [disabled]="!!o.disabled" />
                            }
                          </cb-radio-group>
                        }
                        @case ('buttons') {
                          <cb-selectbutton [formControlName]="f.key" [inputId]="idOf(f)" [ariaLabel]="f.label ?? f.key" [options]="f.options ?? []" optionValue="value" />
                        }
                        @case ('checkbox') {
                          <cb-checkbox [formControlName]="f.key" [inputId]="idOf(f)" [label]="f.label ?? ''" />
                        }
                        @case ('toggle') {
                          <cb-toggle [formControlName]="f.key" [inputId]="idOf(f)" [label]="f.label ?? ''" />
                        }
                        @case ('slider') {
                          <cb-slider [formControlName]="f.key" [inputId]="idOf(f)" [ariaLabel]="f.label ?? f.key" [min]="f.min ?? 0" [max]="f.max ?? 100" [step]="f.step ?? 1" />
                        }
                        @case ('rating') {
                          <cb-rating [formControlName]="f.key" [inputId]="idOf(f)" [ariaLabel]="f.label ?? f.key" />
                        }
                        @case ('chips') {
                          <cb-chips [formControlName]="f.key" [inputId]="idOf(f)" [ariaLabel]="f.label ?? f.key" [placeholder]="f.placeholder ?? ''" />
                        }
                        @case ('color') {
                          <cb-colorpicker [formControlName]="f.key" [inputId]="idOf(f)" [ariaLabel]="f.label ?? f.key" />
                        }
                        @default {
                          <cb-input [formControlName]="f.key" [inputId]="idOf(f)" [type]="inputType(f)" [placeholder]="f.placeholder ?? ''" [readonly]="!!f.readonly" [hint]="f.hint ?? ''" [error]="errorOf(f) ?? ''" />
                        }
                      }
                      @if (!ownsMessages(f)) {
                        @if (errorOf(f); as err) {
                          <p class="cb-df__message cb-df__message--error" role="alert" [id]="idOf(f) + '-error'">{{ err }}</p>
                        } @else if (f.hint) {
                          <p class="cb-df__message" [id]="idOf(f) + '-hint'">{{ f.hint }}</p>
                        }
                      }
                    </div>
                  </div>
                }
              }
            </div>
          </fieldset>
        }
      }

      @if (actions()) {
        <div class="cb-df__actions">
          <span class="cb-df__label cb-df__label--empty" aria-hidden="true"></span>
          <div class="cb-df__buttons">
            <cb-button type="submit" [loading]="loading()" [disabled]="disabled()">{{ schema().submitLabel || t().dynamicFormSubmit }}</cb-button>
            @if (schema().resetLabel) {
              <cb-button type="reset" variant="text" severity="secondary" [disabled]="disabled()">{{ schema().resetLabel }}</cb-button>
            }
          </div>
        </div>
      }
    </form>
  `,
  styleUrl: './dynamic-form.component.css',
})
export class CbDynamicForm {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly uid = `cb-df-${++nextUid}`;

  /** Esquema del formulario (campos o secciones, columnas, disposición…). */
  readonly schema = input.required<CbFormSchema>();
  /** Valor del formulario (bidireccional; los campos ocultos no se incluyen). */
  readonly value = model<Record<string, unknown>>({});
  /** Disposición; si no, la del esquema (`vertical` por defecto). */
  readonly layout = input<CbFormLayout | undefined>(undefined);
  /** Columnas; si no, las del esquema (1 por defecto). */
  readonly columns = input<number | undefined>(undefined);
  /** Ancho de la etiqueta en `horizontal`; si no, el del esquema (`10rem`). */
  readonly labelWidth = input<string | undefined>(undefined);
  /** Botones de enviar (y restablecer, si el esquema tiene `resetLabel`). */
  readonly actions = input<boolean, unknown>(true, { transform: booleanAttribute });
  /** Deshabilita todo el formulario. */
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  /** Muestra el botón de enviar cargando (mientras se guarda). */
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Se envió el formulario y es válido: el valor (sin los campos ocultos). */
  readonly formSubmit = output<Record<string, unknown>>();
  /** Se envió con errores: cuáles (`key` y mensaje). */
  readonly formInvalid = output<{ key: string; message: string }[]>();
  readonly formReset = output<void>();

  protected readonly layoutValue = computed(() => this.layout() ?? this.schema().layout ?? 'vertical');
  protected readonly columnsValue = computed(() => Math.max(1, this.columns() ?? this.schema().columns ?? 1));
  protected readonly labelWidthValue = computed(() => this.labelWidth() ?? this.schema().labelWidth ?? '10rem');
  protected readonly sections = computed(() => sectionsOf(this.schema()));
  private readonly fields = computed(() => fieldsOf(this.schema()));

  /** El `FormGroup` que se arma con el esquema. */
  readonly form = signal(new FormGroup<Record<string, FormControl<unknown>>>({}));
  /** Se incrementa con cada evento del formulario para recalcular estado y errores. */
  private readonly tick = signal(0);
  private readonly submitted = signal(false);
  private readonly hidden = signal<ReadonlySet<string>>(new Set());
  private readonly required = signal<ReadonlySet<string>>(new Set());
  private lastEmitted: Record<string, unknown> | null = null;
  private subscription: Subscription | null = null;

  private readonly texts = computed<FormTexts>(() => {
    const t = this.t();
    return {
      required: t.dynamicFormRequired,
      min: t.dynamicFormMin,
      max: t.dynamicFormMax,
      minLength: t.dynamicFormMinLength,
      maxLength: t.dynamicFormMaxLength,
      email: t.dynamicFormEmail,
      pattern: t.dynamicFormPattern,
      invalid: t.dynamicFormInvalid,
    };
  });

  /** Errores que se listan arriba tras un envío fallido. */
  protected readonly summary = computed(() => {
    this.tick();
    if (!this.submitted()) return [];
    const out: { key: string; field: CbFormField; message: string }[] = [];
    for (const field of this.fields()) {
      const control = this.form().controls[field.key];
      if (!control || control.disabled || control.valid) continue;
      out.push({ key: field.key, field, message: errorMessage(field, control.errors, this.texts()) ?? '' });
    }
    return out;
  });

  constructor() {
    // Cada esquema nuevo arma un FormGroup nuevo.
    effect(() => {
      const fields = this.fields();
      untracked(() => this.build(fields));
    });
    // Un valor que llega de fuera se aplica al formulario.
    effect(() => {
      const value = this.value();
      untracked(() => {
        if (value === this.lastEmitted) return;
        const form = this.form();
        const patch: Record<string, unknown> = {};
        for (const field of this.fields()) if (field.key in value) patch[field.key] = initialValue({ ...field, default: value[field.key] });
        form.patchValue(patch, { emitEvent: false });
        this.sync();
        this.tick.update((n) => n + 1);
      });
    });
    effect(() => {
      const disabled = this.disabled();
      untracked(() => {
        if (disabled) this.form().disable({ emitEvent: false });
        else this.sync();
        this.tick.update((n) => n + 1);
      });
    });
    inject(DestroyRef).onDestroy(() => this.subscription?.unsubscribe());
  }

  // --- API pública -------------------------------------------------------------------------

  /** Valida y, si todo está bien, emite `formSubmit`; si no, muestra el resumen de errores. */
  submit(): void {
    const form = this.form();
    form.markAllAsTouched();
    this.submitted.set(true);
    this.tick.update((n) => n + 1);
    if (form.invalid) {
      this.formInvalid.emit(this.summary().map((s) => ({ key: s.key, message: s.message })));
      afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('.cb-df__summary')?.focus(), { injector: this.injector });
      return;
    }
    this.formSubmit.emit(this.currentValue());
  }

  /** Vuelve a los valores iniciales del esquema. */
  reset(): void {
    const form = this.form();
    const values: Record<string, unknown> = {};
    for (const field of this.fields()) values[field.key] = initialValue(field);
    form.reset(values, { emitEvent: false });
    this.submitted.set(false);
    this.sync();
    this.emitValue();
    this.tick.update((n) => n + 1);
    this.formReset.emit();
  }

  /** Lleva el foco al control de un campo. */
  focusField(key: string): void {
    const box = this.host.nativeElement.querySelector(`[data-key="${CSS.escape(key)}"]`);
    const target = box?.querySelector<HTMLElement>('input:not([type="hidden"]):not([disabled]), textarea, select, button:not([disabled]), [tabindex="0"], [role="combobox"]');
    target?.focus();
  }

  // --- Plantilla ---------------------------------------------------------------------------

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submit();
  }

  protected idOf(field: CbFormField): string {
    return `${this.uid}-${field.key}`;
  }

  protected isInline(field: CbFormField): boolean {
    return INLINE_LABEL.has(field.type ?? 'text');
  }

  protected isLabelable(field: CbFormField): boolean {
    return LABELABLE.has(field.type ?? 'text');
  }

  protected ownsMessages(field: CbFormField): boolean {
    return OWN_MESSAGES.has(field.type ?? 'text');
  }

  protected inputType(field: CbFormField): 'text' | 'email' | 'tel' | 'url' {
    const type = field.type ?? 'text';
    return type === 'email' || type === 'tel' || type === 'url' ? type : 'text';
  }

  protected spanOf(field: CbFormField, cols: number): string | null {
    if (field.colSpan === 'full') return '1 / -1';
    if (typeof field.colSpan === 'number' && field.colSpan > 1) return `span ${Math.min(field.colSpan, cols)}`;
    return null;
  }

  protected isVisible(field: CbFormField): boolean {
    return !this.hidden().has(field.key);
  }

  protected sectionVisible(section: CbFormSection): boolean {
    this.tick();
    return matches(section.visibleWhen, this.rawValue());
  }

  protected isRequired(field: CbFormField): boolean {
    return this.required().has(field.key);
  }

  /** Mensaje de error de un campo, si ya se tocó, se cambió o se intentó enviar. */
  protected errorOf(field: CbFormField): string | null {
    this.tick();
    const control = this.form().controls[field.key];
    if (!control || control.disabled || control.valid) return null;
    if (!control.touched && !control.dirty && !this.submitted()) return null;
    return errorMessage(field, control.errors, this.texts());
  }

  // --- Internos ----------------------------------------------------------------------------

  private build(fields: readonly CbFormField[]): void {
    this.subscription?.unsubscribe();
    const value = untracked(this.value);
    const controls: Record<string, FormControl<unknown>> = {};
    for (const field of fields) {
      const start = field.key in value ? initialValue({ ...field, default: value[field.key] }) : initialValue(field);
      controls[field.key] = new FormControl<unknown>(start);
    }
    const form = new FormGroup(controls);
    this.form.set(form);
    this.submitted.set(false);
    this.sync();
    this.subscription = form.events.subscribe(() => this.tick.update((n) => n + 1));
    this.subscription.add(
      form.valueChanges.subscribe(() => {
        this.sync();
        this.emitValue();
      }),
    );
    this.emitValue();
  }

  /** Aplica las condiciones: visibilidad, obligatoriedad y deshabilitado de cada campo. */
  private sync(): void {
    const form = this.form();
    const raw = this.rawValue();
    const hidden = new Set<string>();
    const required = new Set<string>();
    const disabledAll = this.disabled();
    for (const section of this.sections()) {
      const sectionShown = matches(section.visibleWhen, raw);
      for (const field of section.fields) {
        const control = form.controls[field.key];
        if (!control) continue;
        const shown = sectionShown && matches(field.visibleWhen, raw);
        const isRequired = !!field.required || (!!field.requiredWhen && matches(field.requiredWhen, raw));
        if (!shown) hidden.add(field.key);
        if (isRequired) required.add(field.key);
        control.setValidators(validatorsOf(field, isRequired));
        // Los de solo lectura que no son de texto se deshabilitan (siguen en el valor).
        const readonlyOff = !!field.readonly && !['text', 'email', 'tel', 'url', 'textarea'].includes(field.type ?? 'text');
        const off = disabledAll || !shown || !!field.disabled || readonlyOff || (!!field.disabledWhen && matches(field.disabledWhen, raw));
        if (off && control.enabled) control.disable({ emitEvent: false });
        else if (!off && control.disabled) control.enable({ emitEvent: false });
        control.updateValueAndValidity({ emitEvent: false });
      }
    }
    form.updateValueAndValidity({ emitEvent: false });
    this.hidden.set(hidden);
    this.required.set(required);
  }

  private rawValue(): Record<string, unknown> {
    return this.form().getRawValue() as Record<string, unknown>;
  }

  /** Valor sin los campos ocultos. */
  private currentValue(): Record<string, unknown> {
    const raw = this.rawValue();
    const hidden = this.hidden();
    const out: Record<string, unknown> = {};
    for (const field of this.fields()) if (!hidden.has(field.key)) out[field.key] = raw[field.key];
    return out;
  }

  private emitValue(): void {
    const value = this.currentValue();
    this.lastEmitted = value;
    this.value.set(value);
  }
}
