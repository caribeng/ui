import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, type AbstractControl, type ValidatorFn } from '@angular/forms';
import type { Subscription } from 'rxjs';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbButton } from '@caribeng/ui/button';
import { CbCheckbox } from '@caribeng/ui/checkbox';
import { CbChips } from '@caribeng/ui/chips';
import { CbColorPicker } from '@caribeng/ui/colorpicker';
import { CbDatepicker } from '@caribeng/ui/datepicker';
import { CbIcon } from '@caribeng/ui/icon';
import { CbInput } from '@caribeng/ui/input';
import { CbInputMask } from '@caribeng/ui/inputmask';
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
  checkRules,
  errorMessage,
  evaluateFormula,
  fieldsOf,
  initialValue,
  isFilled,
  isLayout,
  matches,
  ordered,
  responsive,
  sectionsOf,
  stepsOf,
  validatorsOf,
  type CbFormField,
  type CbFormLabelOptions,
  type CbFormLabelPosition,
  type CbFormLayout,
  type CbFormOption,
  type CbFormResponsive,
  type CbFormSchema,
  type CbFormSection,
  type CbFormSize,
  type CbFormText,
  type FormTexts,
} from './dynamic-form-model';

/** Contexto de una plantilla propia `<ng-template cbFormField="nombre" let-control let-field="field">`. */
export interface CbFormFieldContext {
  $implicit: FormControl<unknown>;
  field: CbFormField;
  /** Id para el control (la etiqueta apunta a él con `for`). */
  id: string;
  /** Id de la etiqueta, para `aria-labelledby`. */
  labelId: string;
  error: string | null;
  invalid: boolean;
}

/** Plantilla de un tipo de campo propio: el campo con `type: 'nombre'` la usa. */
@Directive({ selector: 'ng-template[cbFormField]' })
export class CbFormFieldTemplate {
  readonly name = input.required<string>({ alias: 'cbFormField' });
  readonly template = inject<TemplateRef<CbFormFieldContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbFormFieldTemplate, ctx: unknown): ctx is CbFormFieldContext {
    return true;
  }
}

/** Cargador de opciones (API, catálogo): recibe el valor del formulario. */
export type CbFormOptionsLoader = (ctx: { value: Record<string, unknown>; field: CbFormField }) => readonly CbFormOption[] | Promise<readonly CbFormOption[]>;

/** Tipos cuyo control pinta su propia ayuda y error (y los asocia al campo). */
const OWN_MESSAGES = new Set(['text', 'email', 'tel', 'url', 'number', 'textarea', 'date']);
/** Tipos que llevan la etiqueta dentro del control (a la derecha de la casilla). */
const INLINE_LABEL = new Set(['checkbox', 'toggle']);
/** Tipos con un elemento nativo enlazable con `<label for>`. */
const LABELABLE = new Set(['text', 'email', 'tel', 'url', 'password', 'number', 'textarea', 'date', 'mask']);
/** Tipos que admiten etiqueta flotante (dentro de la caja del control). */
const FLOATABLE = new Set(['text', 'email', 'tel', 'url', 'password', 'number', 'textarea', 'date', 'mask', 'select', 'multiselect']);
const BUILT_IN = new Set(['text', 'email', 'password', 'tel', 'url', 'number', 'textarea', 'select', 'multiselect', 'radio', 'checkbox', 'toggle', 'date', 'slider', 'rating', 'chips', 'color', 'buttons', 'mask', 'group', 'heading', 'paragraph', 'divider']);

/** Contexto de la rejilla (raíz, sección, grupo o elemento de una lista). */
interface GridCtx {
  readonly group: FormGroup;
  readonly path: readonly (string | number)[];
  readonly opts: Required<Pick<CbFormLabelOptions, 'labelPosition' | 'labelAlign' | 'labelWidth'>>;
  readonly cols: { base: number; sm: number; md: number; lg: number };
  readonly size: CbFormSize;
}

let nextUid = 0;

/**
 * Formulario dinámico de CaribeNG: arma el formulario a partir de un esquema JSON.
 *
 * - Campos con tipo (texto, correo, número, lista, opciones, casilla, fecha, máscara…),
 *   validación (`required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, reglas
 *   entre campos) y mensajes propios, traducibles (`{ es, en }`).
 * - Etiquetas encima, a la izquierda, a la derecha, flotantes u ocultas, por
 *   formulario, sección o campo; columnas por tamaño de pantalla, orden, filas,
 *   títulos, textos y separadores.
 * - Campos condicionales, opciones que dependen de otro campo o se cargan de una
 *   API, campos calculados con fórmulas, grupos repetibles y formulario por pasos.
 * - Tipos propios con plantillas (`<ng-template cbFormField="firma">`).
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
    NgTemplateOutlet,
    ReactiveFormsModule,
    CbButton,
    CbCheckbox,
    CbChips,
    CbColorPicker,
    CbDatepicker,
    CbIcon,
    CbInput,
    CbInputMask,
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
  host: { class: 'cb-dynamic-form' },
  template: `
    <form class="cb-df__form" [formGroup]="form()" [attr.aria-label]="ariaLabel() || null" novalidate (submit)="onSubmit($event)" (reset)="$event.preventDefault(); reset()">
      @if (steps().length > 1) {
        <ol class="cb-df__steps">
          @for (s of steps(); track $index; let i = $index) {
            <li class="cb-df__step" [class.cb-is-done]="i < step()" [attr.aria-current]="i === step() ? 'step' : null">
              <span class="cb-df__step-num" aria-hidden="true">
                @if (i < step()) {
                  <cb-icon name="check" [size]="13" />
                } @else {
                  {{ i + 1 }}
                }
              </span>
              <span class="cb-df__step-title">{{ tr(s.title) }}</span>
            </li>
          }
        </ol>
        <h3 class="cb-df__step-heading" [id]="uid + '-step'" tabindex="-1">
          <span class="cb-df__sr">{{ fmt(t().dynamicFormStep, step() + 1, steps().length) }}</span>
          {{ tr(steps()[step()].title) }}
        </h3>
        @if (steps()[step()].description) {
          <p class="cb-df__section-desc">{{ tr(steps()[step()].description) }}</p>
        }
      }

      @if (summary().length) {
        <div class="cb-df__summary" role="alert" tabindex="-1" [id]="uid + '-summary'">
          <p class="cb-df__summary-title">
            <cb-icon name="circle-alert" [size]="18" aria-hidden="true" />
            {{ summary().length === 1 ? t().dynamicFormSummaryOne : fmt(t().dynamicFormSummary, summary().length) }}
          </p>
          <ul class="cb-df__summary-list">
            @for (item of summary(); track item.id) {
              <li>
                <a [href]="'#' + item.id" (click)="$event.preventDefault(); focusById(item.id)">{{ item.label }}: {{ item.message }}</a>
              </li>
            }
          </ul>
        </div>
      }

      @for (section of sections(); track $index) {
        @if (sectionVisible(section)) {
          <fieldset class="cb-df__section" [class.cb-df__section--titled]="!!section.title">
            @if (section.title) {
              <legend class="cb-df__legend">{{ tr(section.title) }}</legend>
            }
            @if (section.description) {
              <p class="cb-df__section-desc">{{ tr(section.description) }}</p>
            }
            <ng-container *ngTemplateOutlet="gridTpl; context: { $implicit: section.fields, ctx: rootCtx(section) }" />
          </fieldset>
        }
      }

      @if (actions()) {
        <div class="cb-df__actions" [class]="'cb-df__actions--' + actionsLabelPosition()" [style.--cb-df-label-width]="labelWidthValue()">
          <span class="cb-df__label cb-df__label--empty" aria-hidden="true"></span>
          <div class="cb-df__buttons">
            @if (step() > 0) {
              <cb-button variant="outlined" severity="secondary" [disabled]="disabled()" (click)="back()">{{ tr(schema().backLabel) || t().dynamicFormBack }}</cb-button>
            }
            @if (step() < steps().length - 1) {
              <cb-button [disabled]="disabled()" (click)="next()">{{ tr(schema().nextLabel) || t().dynamicFormNext }}</cb-button>
            } @else {
              <cb-button type="submit" [loading]="loading()" [disabled]="disabled()">{{ tr(schema().submitLabel) || t().dynamicFormSubmit }}</cb-button>
            }
            @if (schema().resetLabel) {
              <cb-button type="reset" variant="text" severity="secondary" [disabled]="disabled()">{{ tr(schema().resetLabel) }}</cb-button>
            }
          </div>
        </div>
      }
      <span class="cb-df__sr" role="status">{{ announcement() }}</span>
    </form>

    <!-- Rejilla de campos (recursiva para grupos y listas). -->
    <ng-template #gridTpl let-fields let-ctx="ctx">
      <div class="cb-df__grid" [style]="gridVars(ctx.cols)">
        @for (f of fields; track $index) {
          @if (isVisible(f, ctx.path, $index)) {
            @switch (kindOf(f)) {
              @case ('heading') {
                <h4 class="cb-df__heading cb-df__cell" [style]="cellVars(f, ctx.cols, true)">{{ tr(f.content ?? f.label) }}</h4>
              }
              @case ('paragraph') {
                <p class="cb-df__paragraph cb-df__cell" [style]="cellVars(f, ctx.cols, true)">{{ tr(f.content ?? f.label) }}</p>
              }
              @case ('divider') {
                <hr class="cb-df__divider cb-df__cell" [style]="cellVars(f, ctx.cols, true)" />
              }
              @case ('list') {
                <fieldset class="cb-df__group cb-df__cell" [style]="cellVars(f, ctx.cols, true)" [attr.data-key]="pathKey(ctx.path, f.key)">
                  <legend class="cb-df__group-title">{{ tr(f.label) }}</legend>
                  @if (f.hint) {
                    <p class="cb-df__message">{{ tr(f.hint) }}</p>
                  }
                  @for (item of listItems(ctx.group, f); track item; let i = $index) {
                    <div class="cb-df__item" role="group" [attr.aria-label]="itemLabel(f, i)">
                      <div class="cb-df__item-head">
                        <span class="cb-df__item-title">{{ itemLabel(f, i) }}</span>
                        @if (!isDisabledForm()) {
                          <cb-button size="sm" variant="text" severity="secondary" [disabled]="listItems(ctx.group, f).length <= (f.minItems ?? 0)" [ariaLabel]="fmt(t().dynamicFormRemove, itemLabel(f, i))" (click)="removeItem(ctx.group, f, i)">
                            <cb-icon name="x" [size]="15" aria-hidden="true" />
                            {{ t().remove }}
                          </cb-button>
                        }
                      </div>
                      <ng-container *ngTemplateOutlet="gridTpl; context: { $implicit: ordered(f.fields ?? []), ctx: childCtx(ctx, f, item, i) }" />
                    </div>
                  }
                  @if (!isDisabledForm() && (f.maxItems === undefined || listItems(ctx.group, f).length < f.maxItems)) {
                    <div>
                      <cb-button size="sm" variant="outlined" (click)="addItem(ctx.group, f)">
                        <cb-icon name="plus" [size]="15" aria-hidden="true" />
                        {{ tr(f.addLabel) || fmt(t().dynamicFormAdd, tr(f.label)) }}
                      </cb-button>
                    </div>
                  }
                </fieldset>
              }
              @case ('group') {
                <fieldset class="cb-df__group cb-df__group--plain cb-df__cell" [style]="cellVars(f, ctx.cols, true)" [attr.data-key]="pathKey(ctx.path, f.key)">
                  @if (f.label) {
                    <legend class="cb-df__group-title">{{ tr(f.label) }}</legend>
                  }
                  <ng-container *ngTemplateOutlet="gridTpl; context: { $implicit: ordered(f.fields ?? []), ctx: childCtx(ctx, f, subGroup(ctx.group, f), null) }" />
                </fieldset>
              }
              @default {
                <ng-container *ngTemplateOutlet="fieldTpl; context: { $implicit: f, ctx: ctx }" />
              }
            }
          }
        }
      </div>
    </ng-template>

    <!-- Un campo con su etiqueta, control, ayuda y error. -->
    <ng-template #fieldTpl let-f let-ctx="ctx">
      @let id = idOf(ctx.path, f.key);
      @let ctrl = controlOf(ctx.group, f);
      @let pos = labelPos(f, ctx);
      @let err = errorOf(ctx.path, f, ctrl);
      <div
        class="cb-df__field cb-df__cell"
        [class]="'cb-df__field--' + pos"
        [class.cb-df__field--inline]="isInline(f)"
        [class.cb-df__field--end]="(f.labelAlign ?? ctx.opts.labelAlign) === 'end'"
        [class.cb-df__field--filled]="pos === 'floating' && filled(ctrl)"
        [style]="cellVars(f, ctx.cols, false) + ';--cb-df-label-width:' + (f.labelWidth ?? ctx.opts.labelWidth)"
        [attr.data-key]="pathKey(ctx.path, f.key)"
      >
        @if (isInline(f)) {
          <span class="cb-df__label cb-df__label--empty" aria-hidden="true"></span>
        } @else if (isLabelable(f)) {
          <label class="cb-df__label" [class.cb-df__sr]="pos === 'hidden'" [attr.for]="id" [id]="id + '-label'">
            {{ tr(f.label) }}
            @if (isRequired(ctx.path, f.key)) {
              <span class="cb-df__req" aria-hidden="true">*</span>
            }
          </label>
        } @else {
          <span class="cb-df__label" [class.cb-df__sr]="pos === 'hidden'" [id]="id + '-label'">
            {{ tr(f.label) }}
            @if (isRequired(ctx.path, f.key)) {
              <span class="cb-df__req" aria-hidden="true">*</span>
            }
          </span>
        }
        <div class="cb-df__control">
          <div class="cb-df__addons" [class.cb-df__addons--on]="!!(f.prefix || f.suffix || f.icon)">
            @if (f.icon) {
              <span class="cb-df__addon cb-df__addon--icon" aria-hidden="true"><cb-icon [name]="f.icon" [size]="16" /></span>
            }
            @if (f.prefix) {
              <span class="cb-df__addon" aria-hidden="true">{{ tr(f.prefix) }}</span>
            }
            <div class="cb-df__input">
              @switch (controlKind(f)) {
                @case ('textarea') {
                  <cb-textarea [formControl]="ctrl" [inputId]="id" [size]="sizeOf(f, ctx)" [placeholder]="placeholderOf(f, pos)" [rows]="f.rows ?? 3" [maxlength]="f.maxLength ?? null" [readonly]="isReadonly(f)" [hint]="tr(f.hint)" [error]="err ?? ''" />
                }
                @case ('number') {
                  <cb-input-number [formControl]="ctrl" [inputId]="id" [size]="sizeOf(f, ctx)" [placeholder]="placeholderOf(f, pos)" [min]="f.min ?? null" [max]="f.max ?? null" [step]="f.step ?? 1" [readonly]="isReadonly(f)" [hint]="tr(f.hint)" [error]="err ?? ''" />
                }
                @case ('date') {
                  <cb-datepicker [formControl]="ctrl" [inputId]="id" [size]="sizeOf(f, ctx)" [placeholder]="placeholderOf(f, pos)" [hint]="tr(f.hint)" [error]="err ?? ''" />
                }
                @case ('password') {
                  <cb-password [formControl]="ctrl" [inputId]="id" [size]="sizeOf(f, ctx)" [placeholder]="placeholderOf(f, pos)" [feedback]="false" />
                }
                @case ('mask') {
                  <cb-input-mask [formControl]="ctrl" [inputId]="id" [mask]="f.mask ?? '999-999'" [placeholder]="placeholderOf(f, pos)" [ariaLabel]="tr(f.label)" />
                }
                @case ('select') {
                  <cb-select [formControl]="ctrl" [inputId]="id" [size]="sizeOf(f, ctx)" [ariaLabelledBy]="id + '-label'" [options]="optionsOf(ctx.path, f)" optionValue="value" [placeholder]="pos === 'floating' ? ' ' : tr(f.placeholder) || t().select" />
                }
                @case ('multiselect') {
                  <cb-multiselect [formControl]="ctrl" [inputId]="id" [size]="sizeOf(f, ctx)" [ariaLabelledBy]="id + '-label'" [options]="optionsOf(ctx.path, f)" optionValue="value" [placeholder]="pos === 'floating' ? ' ' : tr(f.placeholder) || t().select" />
                }
                @case ('radio') {
                  <cb-radio-group [formControl]="ctrl" [ariaLabel]="tr(f.label) || f.key" [orientation]="f.orientation ?? 'vertical'">
                    @for (o of optionsOf(ctx.path, f); track $index) {
                      <cb-radio [value]="o.value" [label]="o.label" [disabled]="!!o.disabled" />
                    }
                  </cb-radio-group>
                }
                @case ('buttons') {
                  <cb-selectbutton [formControl]="ctrl" [inputId]="id" [size]="sizeOf(f, ctx)" [ariaLabel]="tr(f.label) || f.key" [options]="optionsOf(ctx.path, f)" optionValue="value" />
                }
                @case ('checkbox') {
                  <cb-checkbox [formControl]="ctrl" [inputId]="id" [label]="tr(f.label)" />
                }
                @case ('toggle') {
                  <cb-toggle [formControl]="ctrl" [inputId]="id" [label]="tr(f.label)" />
                }
                @case ('slider') {
                  <cb-slider [formControl]="ctrl" [inputId]="id" [ariaLabel]="tr(f.label) || f.key" [min]="f.min ?? 0" [max]="f.max ?? 100" [step]="f.step ?? 1" />
                }
                @case ('rating') {
                  <cb-rating [formControl]="ctrl" [inputId]="id" [ariaLabel]="tr(f.label) || f.key" />
                }
                @case ('chips') {
                  <cb-chips [formControl]="ctrl" [inputId]="id" [ariaLabel]="tr(f.label) || f.key" [placeholder]="placeholderOf(f, pos)" />
                }
                @case ('color') {
                  <cb-colorpicker [formControl]="ctrl" [inputId]="id" [ariaLabel]="tr(f.label) || f.key" />
                }
                @case ('custom') {
                  <ng-container *ngTemplateOutlet="customTemplate(f)!; context: { $implicit: ctrl, field: f, id: id, labelId: id + '-label', error: err, invalid: !!err }" />
                }
                @default {
                  <cb-input [formControl]="ctrl" [inputId]="id" [size]="sizeOf(f, ctx)" [type]="inputType(f)" [placeholder]="placeholderOf(f, pos)" [readonly]="isReadonly(f)" [hint]="tr(f.hint)" [error]="err ?? ''" />
                }
              }
            </div>
            @if (f.suffix) {
              <span class="cb-df__addon" aria-hidden="true">{{ tr(f.suffix) }}</span>
            }
          </div>
          @if (!ownsMessages(f)) {
            @if (err) {
              <p class="cb-df__message cb-df__message--error" role="alert" [id]="id + '-error'">{{ err }}</p>
            } @else if (f.hint) {
              <p class="cb-df__message" [id]="id + '-hint'">{{ tr(f.hint) }}</p>
            }
          }
        </div>
      </div>
    </ng-template>
  `,
  styleUrl: './dynamic-form.component.css',
})
export class CbDynamicForm {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  protected readonly ordered = ordered;
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly uid = `cb-df-${++nextUid}`;
  private readonly templates = contentChildren(CbFormFieldTemplate);

  /** Esquema del formulario (campos, secciones o pasos, columnas, etiquetas…). */
  readonly schema = input.required<CbFormSchema>();
  /** Valor del formulario (bidireccional; los campos ocultos no se incluyen). */
  readonly value = model<Record<string, unknown>>({});
  /** Disposición (atajo de `labelPosition`); si no, la del esquema. */
  readonly layout = input<CbFormLayout | undefined>(undefined);
  /** Posición de las etiquetas; si no, la del esquema (encima por defecto). */
  readonly labelPosition = input<CbFormLabelPosition | undefined>(undefined);
  /** Columnas; si no, las del esquema (1 por defecto). */
  readonly columns = input<CbFormResponsive<number> | undefined>(undefined);
  /** Ancho de la etiqueta a un lado; si no, el del esquema (`10rem`). */
  readonly labelWidth = input<string | undefined>(undefined);
  /** Tamaño de los controles; si no, el del esquema (`md`). */
  readonly size = input<CbFormSize | undefined>(undefined);
  /** Cargadores de opciones por nombre (`optionsLoader` en el esquema). */
  readonly loaders = input<Readonly<Record<string, CbFormOptionsLoader>>>({});
  /** Traduce los textos del esquema que son claves (`'clientes.nombre'` → `'Nombre'`). */
  readonly translate = input<((text: string) => string) | null>(null);
  /** Botones de enviar (y restablecer, si el esquema tiene `resetLabel`). */
  readonly actions = input<boolean, unknown>(true, { transform: booleanAttribute });
  /** Deshabilita todo el formulario. */
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  /** Muestra el botón de enviar cargando (mientras se guarda). */
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Se envió el formulario y es válido: el valor (sin los campos ocultos). */
  readonly formSubmit = output<Record<string, unknown>>();
  /** Se envió (o se intentó pasar de paso) con errores: cuáles (`key` y mensaje). */
  readonly formInvalid = output<{ key: string; message: string }[]>();
  readonly formReset = output<void>();
  /** Cambio de paso (índice desde 0). */
  readonly stepChange = output<number>();

  protected readonly steps = computed(() => stepsOf(this.schema()));
  protected readonly step = signal(0);
  protected readonly sections = computed(() => sectionsOf(this.steps()[Math.min(this.step(), this.steps().length - 1)]));
  private readonly fields = computed(() => fieldsOf(this.schema()));

  protected readonly basePosition = computed<CbFormLabelPosition>(() => {
    const layout = this.layout() ?? this.schema().layout;
    return this.labelPosition() ?? this.schema().labelPosition ?? (layout === 'horizontal' ? 'left' : 'top');
  });
  protected readonly labelWidthValue = computed(() => this.labelWidth() ?? this.schema().labelWidth ?? '10rem');
  protected readonly actionsLabelPosition = computed(() => (this.basePosition() === 'left' ? 'left' : 'top'));
  private readonly sizeValue = computed<CbFormSize>(() => this.size() ?? this.schema().size ?? 'md');
  private readonly baseCols = computed(() => this.columns() ?? this.schema().columns ?? 1);

  /** El `FormGroup` que se arma con el esquema. */
  readonly form = signal(new FormGroup<Record<string, AbstractControl>>({}));
  /** Se incrementa con cada evento del formulario para recalcular estado y errores. */
  private readonly tick = signal(0);
  /** Paso cuyos errores se muestran (tras intentar avanzar o enviar). */
  private readonly attempted = signal(-1);
  private readonly hidden = signal<ReadonlySet<string>>(new Set());
  private readonly required = signal<ReadonlySet<string>>(new Set());
  private readonly options = signal<ReadonlyMap<string, readonly CbFormOption[]>>(new Map());
  private readonly depsKeys = new Map<string, string>();
  protected readonly announcement = signal('');
  private lastEmitted: Record<string, unknown> | null = null;
  private subscription: Subscription | null = null;
  private syncing = false;

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

  /** Errores que se listan arriba tras un envío o un intento de avanzar fallido. */
  protected readonly summary = computed(() => {
    this.tick();
    if (this.attempted() !== this.step()) return [];
    const out: { id: string; label: string; message: string }[] = [];
    const walk = (fields: readonly CbFormField[], group: FormGroup, path: (string | number)[]) => {
      for (const f of fields) {
        if (isLayout(f) || !f.key) continue;
        const ctrl = group.controls[f.key];
        if (!ctrl || ctrl.disabled) continue;
        if (f.type === 'group') {
          if (f.repeatable) (ctrl as FormArray<FormGroup>).controls.forEach((g, i) => walk(ordered(f.fields ?? []), g, [...path, f.key!, i]));
          else walk(ordered(f.fields ?? []), ctrl as FormGroup, [...path, f.key]);
          continue;
        }
        if (ctrl.valid) continue;
        const label = path.length ? `${this.tr(f.label) || f.key} (${this.pathLabel(path)})` : this.tr(f.label) || f.key;
        out.push({ id: this.idOf(path, f.key), label, message: errorMessage(f, ctrl.errors, this.texts(), (x) => this.tr(x)) ?? '' });
      }
    };
    for (const s of this.sections()) walk(s.fields, this.form(), []);
    return out;
  });

  constructor() {
    // Cada esquema nuevo arma un FormGroup nuevo.
    effect(() => {
      const fields = this.fields();
      untracked(() => {
        this.step.set(0);
        this.build(fields, this.value());
      });
    });
    // Un valor que llega de fuera vuelve a armar el formulario con él.
    effect(() => {
      const value = this.value();
      untracked(() => {
        if (value === this.lastEmitted) return;
        this.build(this.fields(), value);
      });
    });
    effect(() => {
      this.disabled();
      untracked(() => {
        this.sync();
        this.tick.update((n) => n + 1);
      });
    });
    inject(DestroyRef).onDestroy(() => this.subscription?.unsubscribe());
  }

  // --- API pública -------------------------------------------------------------------------

  /** Valida y, si todo está bien, emite `formSubmit`; si no, muestra el resumen de errores. */
  submit(): void {
    if (this.step() < this.steps().length - 1) {
      this.next();
      return;
    }
    if (!this.validateStep(this.step())) return;
    // En un formulario por pasos se revisa también el resto (por si algo cambió).
    for (let i = 0; i < this.steps().length; i++) {
      if (!this.validateStep(i, false)) {
        this.goTo(i);
        this.validateStep(i);
        return;
      }
    }
    this.formSubmit.emit(this.currentValue());
  }

  /** Pasa al paso siguiente si los campos del actual son válidos. */
  next(): void {
    if (!this.validateStep(this.step())) return;
    this.goTo(this.step() + 1);
  }

  /** Vuelve al paso anterior (sin validar). */
  back(): void {
    this.goTo(this.step() - 1);
  }

  /** Vuelve a los valores iniciales del esquema. */
  reset(): void {
    this.attempted.set(-1);
    this.step.set(0);
    this.build(this.fields(), {});
    this.formReset.emit();
  }

  /** Lleva el foco al control de un campo (por su `key` de primer nivel). */
  focusField(key: string): void {
    this.focusById(this.idOf([], key));
  }

  // --- Plantilla ---------------------------------------------------------------------------

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submit();
  }

  /** Texto del esquema resuelto: por idioma (`{ es, en }`) y con `translate`. */
  tr(text: CbFormText | undefined | null): string {
    if (text === undefined || text === null) return '';
    if (typeof text === 'string') return this.translate()?.(text) ?? text;
    const locale = this.t().intlLocale;
    return text[locale] ?? text[locale.split('-')[0]] ?? Object.values(text)[0] ?? '';
  }

  protected rootCtx(section: CbFormSection): GridCtx {
    const schema = this.schema();
    return {
      group: this.form(),
      path: [],
      opts: {
        labelPosition: section.labelPosition ?? this.basePosition(),
        labelAlign: section.labelAlign ?? schema.labelAlign ?? 'start',
        labelWidth: section.labelWidth ?? this.labelWidthValue(),
      },
      cols: this.colsOf(section.columns ?? this.baseCols()),
      size: section.size ?? this.sizeValue(),
    };
  }

  protected childCtx(parent: GridCtx, f: CbFormField, group: FormGroup, index: number | null): GridCtx {
    return {
      group,
      path: index === null ? [...parent.path, f.key!] : [...parent.path, f.key!, index],
      opts: {
        labelPosition: f.labelPosition ?? parent.opts.labelPosition,
        labelAlign: f.labelAlign ?? parent.opts.labelAlign,
        labelWidth: f.labelWidth ?? parent.opts.labelWidth,
      },
      cols: this.colsOf(f.columns ?? 1),
      size: f.size ?? parent.size,
    };
  }

  /** Columnas por tamaño: un número fijo `n` es 1 en móvil y `n` desde 40rem. */
  private colsOf(value: CbFormResponsive<number>): { base: number; sm: number; md: number; lg: number } {
    if (typeof value === 'number') return { base: 1, sm: 1, md: Math.max(1, value), lg: Math.max(1, value) };
    return responsive(value, 1);
  }

  protected gridVars(cols: { base: number; sm: number; md: number; lg: number }): string {
    return `--df-cols-base:${cols.base};--df-cols-sm:${cols.sm};--df-cols-md:${cols.md};--df-cols-lg:${cols.lg}`;
  }

  /** Columnas que ocupa un elemento en cada tamaño (`full` o `span n`), y si empieza fila. */
  protected cellVars(f: CbFormField, cols: { base: number; sm: number; md: number; lg: number }, wideByDefault: boolean): string {
    const span = responsive<number | 'full'>(f.colSpan, wideByDefault ? 'full' : 1);
    const one = (bp: 'base' | 'sm' | 'md' | 'lg') => {
      const s = span[bp];
      const n = s === 'full' ? cols[bp] : Math.min(Math.max(1, s), cols[bp]);
      if (s === 'full' || n >= cols[bp]) return '1 / -1';
      return f.newRow ? `1 / span ${n}` : `span ${n}`;
    };
    return `--df-col-base:${one('base')};--df-col-sm:${one('sm')};--df-col-md:${one('md')};--df-col-lg:${one('lg')}`;
  }

  protected kindOf(f: CbFormField): 'heading' | 'paragraph' | 'divider' | 'list' | 'group' | 'field' {
    const type = f.type ?? 'text';
    if (type === 'heading' || type === 'paragraph' || type === 'divider') return type as 'heading' | 'paragraph' | 'divider';
    if (type === 'group') return f.repeatable ? 'list' : 'group';
    return 'field';
  }

  protected controlKind(f: CbFormField): string {
    const type = f.type ?? 'text';
    if (BUILT_IN.has(type)) return type === 'email' || type === 'tel' || type === 'url' ? 'text' : type;
    return this.customTemplate(f) ? 'custom' : 'text';
  }

  protected customTemplate(f: CbFormField): TemplateRef<CbFormFieldContext> | null {
    return this.templates().find((t) => t.name() === f.type)?.template ?? null;
  }

  protected labelPos(f: CbFormField, ctx: GridCtx): CbFormLabelPosition {
    const pos = f.labelPosition ?? ctx.opts.labelPosition;
    if (pos === 'floating' && !FLOATABLE.has(f.type ?? 'text')) return 'top';
    return pos;
  }

  protected placeholderOf(f: CbFormField, pos: CbFormLabelPosition): string {
    // Con etiqueta flotante, la etiqueta hace de placeholder.
    return pos === 'floating' ? '' : this.tr(f.placeholder);
  }

  protected sizeOf(f: CbFormField, ctx: GridCtx): CbFormSize {
    return f.size ?? ctx.size;
  }

  protected isReadonly(f: CbFormField): boolean {
    return !!f.readonly || !!f.formula || !!f.compute;
  }

  protected filled(ctrl: AbstractControl): boolean {
    this.tick();
    return isFilled(ctrl.value);
  }

  protected pathKey(path: readonly (string | number)[], key: string | undefined): string {
    return [...path, key ?? ''].join('.');
  }

  protected idOf(path: readonly (string | number)[], key: string | undefined): string {
    return `${this.uid}-${[...path, key ?? ''].join('-')}`;
  }

  private pathLabel(path: readonly (string | number)[]): string {
    const parts: string[] = [];
    let fields: readonly CbFormField[] = this.fields();
    for (let i = 0; i < path.length; i++) {
      const f = fields.find((x) => x.key === path[i]);
      if (!f) break;
      if (f.repeatable && typeof path[i + 1] === 'number') {
        parts.push(this.itemLabel(f, path[i + 1] as number));
        i++;
      } else parts.push(this.tr(f.label) || f.key!);
      fields = f.fields ?? [];
    }
    return parts.join(' › ');
  }

  protected isInline(f: CbFormField): boolean {
    return INLINE_LABEL.has(f.type ?? 'text');
  }

  protected isLabelable(f: CbFormField): boolean {
    return LABELABLE.has(f.type ?? 'text') || (!BUILT_IN.has(f.type ?? 'text') && !!this.customTemplate(f));
  }

  protected ownsMessages(f: CbFormField): boolean {
    return OWN_MESSAGES.has(f.type ?? 'text');
  }

  protected inputType(f: CbFormField): 'text' | 'email' | 'tel' | 'url' {
    const type = f.type ?? 'text';
    return type === 'email' || type === 'tel' || type === 'url' ? (type as 'email' | 'tel' | 'url') : 'text';
  }

  protected controlOf(group: FormGroup, f: CbFormField): FormControl<unknown> {
    return group.controls[f.key!] as FormControl<unknown>;
  }

  protected subGroup(group: FormGroup, f: CbFormField): FormGroup {
    return group.controls[f.key!] as FormGroup;
  }

  protected listItems(group: FormGroup, f: CbFormField): FormGroup[] {
    this.tick();
    return (group.controls[f.key!] as FormArray<FormGroup>).controls;
  }

  protected itemLabel(f: CbFormField, i: number): string {
    const template = this.tr(f.itemLabel) || cbFormat(this.t().dynamicFormItem, '{n}');
    return template.replace('{n}', String(i + 1));
  }

  protected isDisabledForm(): boolean {
    return this.disabled();
  }

  protected isVisible(f: CbFormField, path: readonly (string | number)[], index: number): boolean {
    return !this.hidden().has(this.pathKey(path, f.key ?? `#${index}`));
  }

  protected sectionVisible(section: CbFormSection): boolean {
    this.tick();
    return matches(section.visibleWhen, this.rawValue());
  }

  protected isRequired(path: readonly (string | number)[], key: string | undefined): boolean {
    return this.required().has(this.pathKey(path, key));
  }

  protected optionsOf(path: readonly (string | number)[], f: CbFormField): { label: string; value: unknown; disabled?: boolean }[] {
    const list = f.optionsFrom || f.optionsLoader ? (this.options().get(this.pathKey(path, f.key)) ?? []) : (f.options ?? []);
    return list.map((o) => ({ label: this.tr(o.label), value: o.value, disabled: o.disabled }));
  }

  /** Mensaje de error de un campo, si ya se tocó, se cambió o se intentó enviar. */
  protected errorOf(path: readonly (string | number)[], f: CbFormField, ctrl: AbstractControl): string | null {
    this.tick();
    if (!ctrl || ctrl.disabled || ctrl.valid) return null;
    if (!ctrl.touched && !ctrl.dirty && this.attempted() !== this.step()) return null;
    return errorMessage(f, ctrl.errors, this.texts(), (x) => this.tr(x));
  }

  protected addItem(group: FormGroup, f: CbFormField): void {
    const arr = group.controls[f.key!] as FormArray<FormGroup>;
    if (f.maxItems !== undefined && arr.length >= f.maxItems) return;
    arr.push(this.buildGroup(ordered(f.fields ?? []), {}));
    this.say(cbFormat(this.t().dynamicFormAdded, this.itemLabel(f, arr.length - 1)));
    afterNextRender(
      () => {
        const items = this.host.nativeElement.querySelectorAll<HTMLElement>(`[data-key="${CSS.escape(f.key!)}"] .cb-df__item`);
        items[items.length - 1]?.querySelector<HTMLElement>('input, textarea, [role="combobox"], button:not(.cb-button)')?.focus();
      },
      { injector: this.injector },
    );
  }

  protected removeItem(group: FormGroup, f: CbFormField, i: number): void {
    const arr = group.controls[f.key!] as FormArray<FormGroup>;
    if (arr.length <= (f.minItems ?? 0)) return;
    const label = this.itemLabel(f, i);
    arr.removeAt(i);
    this.say(cbFormat(this.t().dynamicFormRemoved, label));
  }

  focusById(id: string): void {
    const el = this.host.nativeElement.ownerDocument.getElementById(id);
    const box = el?.closest('[data-key]') ?? el;
    const target = el?.matches('input, textarea, select, button, [tabindex]') ? el : box?.querySelector<HTMLElement>('input:not([type="hidden"]):not([disabled]), textarea, select, button:not([disabled]), [tabindex="0"], [role="combobox"]');
    target?.focus();
  }

  // --- Internos ----------------------------------------------------------------------------

  private goTo(i: number): void {
    const next = Math.max(0, Math.min(this.steps().length - 1, i));
    if (next === this.step()) return;
    this.step.set(next);
    this.stepChange.emit(next);
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('.cb-df__step-heading')?.focus(), { injector: this.injector });
  }

  /** Marca los campos de un paso y dice si son válidos (con `show`, muestra el resumen). */
  private validateStep(i: number, show = true): boolean {
    const step = this.steps()[i];
    const fields = sectionsOf(step).flatMap((s) => s.fields).filter((f) => !isLayout(f) && f.key);
    let valid = true;
    for (const f of fields) {
      const ctrl = this.form().controls[f.key!];
      if (!ctrl || ctrl.disabled) continue;
      if (show) ctrl.markAllAsTouched();
      if (ctrl.invalid) valid = false;
    }
    if (show) {
      this.attempted.set(valid ? -1 : i);
      this.tick.update((n) => n + 1);
      if (!valid) {
        this.formInvalid.emit(this.summary().map((s) => ({ key: s.id.replace(`${this.uid}-`, ''), message: s.message })));
        afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('.cb-df__summary')?.focus(), { injector: this.injector });
      }
    }
    return valid;
  }

  private build(fields: readonly CbFormField[], value: Record<string, unknown>): void {
    this.subscription?.unsubscribe();
    this.depsKeys.clear();
    const form = this.buildGroup(fields, value);
    this.form.set(form);
    this.attempted.set(-1);
    this.sync();
    this.subscription = form.events.subscribe(() => this.tick.update((n) => n + 1));
    this.subscription.add(
      form.valueChanges.subscribe(() => {
        if (this.syncing) return;
        this.sync();
        this.emitValue();
      }),
    );
    this.emitValue();
  }

  private buildGroup(fields: readonly CbFormField[], value: Record<string, unknown> | undefined): FormGroup {
    const controls: Record<string, AbstractControl> = {};
    const v = value ?? {};
    for (const f of fields) {
      if (isLayout(f) || !f.key) continue;
      const has = f.key in v;
      if (f.type === 'group') {
        const inner = ordered(f.fields ?? []);
        if (f.repeatable) {
          const items = (has ? v[f.key] : f.default) as Record<string, unknown>[] | undefined;
          const list = Array.isArray(items) ? items : [];
          while (list.length < (f.minItems ?? 0)) list.push({});
          controls[f.key] = new FormArray(list.map((item) => this.buildGroup(inner, item)));
        } else controls[f.key] = this.buildGroup(inner, (has ? v[f.key] : f.default) as Record<string, unknown> | undefined);
        continue;
      }
      controls[f.key] = new FormControl<unknown>(initialValue(has ? { ...f, default: v[f.key] } : f));
    }
    return new FormGroup(controls);
  }

  /** Aplica condiciones, cálculos, opciones y validaciones en todo el árbol. */
  private sync(): void {
    if (this.syncing) return;
    this.syncing = true;
    try {
      const hidden = new Set<string>();
      const required = new Set<string>();
      // Varias pasadas: un total de una lista depende de los cálculos de cada elemento.
      for (let pass = 0; pass < 3; pass++) {
        hidden.clear();
        required.clear();
        const root = this.rawValue();
        for (const step of this.steps()) {
          for (const section of sectionsOf(step)) {
            const shown = matches(section.visibleWhen, root);
            this.walk(section.fields, this.form(), [], root, shown, hidden, required);
          }
        }
      }
      this.form().updateValueAndValidity({ emitEvent: false });
      this.hidden.set(hidden);
      this.required.set(required);
    } finally {
      this.syncing = false;
    }
  }

  private walk(fields: readonly CbFormField[], group: FormGroup, path: (string | number)[], scope: Record<string, unknown>, shown: boolean, hidden: Set<string>, required: Set<string>): void {
    const disabledAll = this.disabled();
    fields.forEach((f, index) => {
      const key = this.pathKey(path, f.key ?? `#${index}`);
      const visible = shown && matches(f.visibleWhen, scope);
      if (!visible) hidden.add(key);
      if (isLayout(f) || !f.key) return;
      const ctrl = group.controls[f.key];
      if (!ctrl) return;
      if (f.type === 'group') {
        const inner = ordered(f.fields ?? []);
        if (f.repeatable) {
          (ctrl as FormArray<FormGroup>).controls.forEach((g, i) => this.walk(inner, g, [...path, f.key!, i], { ...scope, ...g.getRawValue() }, visible, hidden, required));
        } else this.walk(inner, ctrl as FormGroup, [...path, f.key], { ...scope, ...(ctrl as FormGroup).getRawValue() }, visible, hidden, required);
        this.setEnabled(ctrl, !(disabledAll || !visible || !!f.disabled));
        return;
      }
      // Campo calculado.
      if (f.formula || f.compute) {
        let result: unknown = null;
        try {
          result = f.compute ? f.compute(scope) : evaluateFormula(f.formula!, scope);
        } catch {
          result = null;
        }
        if (result !== ctrl.value) ctrl.setValue(result, { emitEvent: false });
        // Los campos siguientes ya ven el resultado (neto → IVA → total en la misma pasada).
        scope[f.key] = result;
      }
      // Opciones dependientes.
      if (f.optionsFrom || f.optionsLoader) this.syncOptions(f, key, ctrl, scope);
      const isRequired = !!f.required || (!!f.requiredWhen && matches(f.requiredWhen, scope));
      if (isRequired) required.add(key);
      const validators: ValidatorFn[] = validatorsOf(f, isRequired);
      if (f.rules?.length) {
        const snapshot = scope;
        validators.push((c) => {
          const rule = checkRules(f.rules, c.value, snapshot);
          return rule ? { rule: this.tr(rule.message) || this.texts().invalid } : null;
        });
      }
      ctrl.setValidators(validators);
      // Los de solo lectura que no son de texto se deshabilitan (siguen en el valor).
      const readonlyOff = !!f.readonly && !['text', 'email', 'tel', 'url', 'textarea', 'number'].includes(f.type ?? 'text');
      const off = disabledAll || !visible || !!f.disabled || readonlyOff || (!!f.disabledWhen && matches(f.disabledWhen, scope));
      this.setEnabled(ctrl, !off);
      ctrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  private setEnabled(ctrl: AbstractControl, enabled: boolean): void {
    if (enabled && ctrl.disabled) ctrl.enable({ emitEvent: false });
    else if (!enabled && ctrl.enabled) ctrl.disable({ emitEvent: false });
  }

  /** Opciones de `optionsFrom` / `optionsLoader`: se recalculan al cambiar las dependencias. */
  private syncOptions(f: CbFormField, key: string, ctrl: AbstractControl, scope: Record<string, unknown>): void {
    const deps = f.optionsFrom ? [f.optionsFrom.field] : (f.dependsOn ?? []);
    const depsKey = JSON.stringify(deps.map((d) => scope[d] ?? null));
    const before = this.depsKeys.get(key);
    if (before === depsKey) return;
    this.depsKeys.set(key, depsKey);
    const changed = before !== undefined;
    const apply = (list: readonly CbFormOption[], emit: boolean) => {
      this.options.update((m) => new Map(m).set(key, list));
      // Si el valor ya no está entre las opciones nuevas, se limpia.
      if (changed && isFilled(ctrl.value)) {
        const values = new Set(list.map((o) => o.value));
        const current = ctrl.value;
        const keep = Array.isArray(current) ? current.filter((v) => values.has(v)) : values.has(current) ? current : null;
        if (JSON.stringify(keep) !== JSON.stringify(current)) ctrl.setValue(Array.isArray(current) ? keep : keep, { emitEvent: emit });
      }
    };
    if (f.optionsFrom) {
      apply(f.optionsFrom.map[String(scope[f.optionsFrom.field] ?? '')] ?? [], false);
      return;
    }
    const loader = this.loaders()[f.optionsLoader!];
    if (!loader) return;
    Promise.resolve(loader({ value: scope, field: f })).then((list) => {
      if (this.depsKeys.get(key) === depsKey) apply(list ?? [], true);
    });
  }

  private rawValue(): Record<string, unknown> {
    return this.form().getRawValue() as Record<string, unknown>;
  }

  /** Valor sin los campos ocultos (en todos los niveles). */
  private currentValue(): Record<string, unknown> {
    const hidden = this.hidden();
    const strip = (fields: readonly CbFormField[], value: Record<string, unknown>, path: (string | number)[]): Record<string, unknown> => {
      const out: Record<string, unknown> = {};
      for (const f of fields) {
        if (isLayout(f) || !f.key || hidden.has(this.pathKey(path, f.key))) continue;
        const v = value?.[f.key];
        if (f.type === 'group') {
          const inner = ordered(f.fields ?? []);
          out[f.key] = f.repeatable
            ? ((v as Record<string, unknown>[] | undefined) ?? []).map((item, i) => strip(inner, item, [...path, f.key!, i]))
            : strip(inner, (v as Record<string, unknown>) ?? {}, [...path, f.key]);
        } else out[f.key] = v;
      }
      return out;
    };
    return strip(this.fields(), this.rawValue(), []);
  }

  private emitValue(): void {
    const value = this.currentValue();
    this.lastEmitted = value;
    this.value.set(value);
  }

  private say(message: string): void {
    this.announcement.set('');
    queueMicrotask(() => this.announcement.set(message));
  }
}
