import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, type AbstractControl, type ControlValueAccessor, type ValidationErrors, type Validator } from '@angular/forms';
import { Overlay, type OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { cbFieldState, injectCbTranslation, type CbRequiredIndicator, type CbSize } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';
import {
  CB_PHONE_COUNTRIES,
  type CbPhoneCountry,
  cbFlagEmoji,
  cbFormatNational,
  cbIsValidPhone,
  cbParsePhone,
  cbToE164,
} from './phone-countries';

/** Cambio del teléfono con todos sus datos. */
export interface CbPhoneChange {
  /** Formato internacional E.164 (`+573001234567`), o `''`. */
  readonly e164: string;
  /** Número nacional (solo dígitos). */
  readonly national: string;
  /** Código ISO del país (`CO`). */
  readonly country: string;
  /** La longitud es válida para el país. */
  readonly valid: boolean;
}

let nextUid = 0;

const toBoolean = (value: unknown) => value !== false && value !== 'false' && value != null;

/**
 * Teléfono internacional de CaribeNG: selector de país (bandera, nombre y
 * prefijo, con buscador) y número que se formatea mientras se escribe. El
 * valor es E.164 (`+573001234567`), listo para guardar o enviar. Al pegar un
 * número con `+` o `00` detecta el país.
 *
 * Funciona con Angular Forms (`formControlName`, `ngModel`) y añade el error
 * `{ phone: true }` si el número está incompleto o no es válido para el país.
 *
 * @example
 * ```html
 * <cb-phone-input label="Celular" formControlName="celular" country="CO" [preferredCountries]="['CO', 'MX', 'US']" />
 * ```
 */
@Component({
  selector: 'cb-phone-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-phone-input' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CbPhoneInput), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => CbPhoneInput), multi: true },
  ],
  template: `
    @if (label()) {
      <label class="cb-phone-input__label" [attr.for]="inputId">
        {{ label() }}
        @if (fieldState.indicator(); as mark) {
          <span [class]="'cb-phone-input__required cb-phone-input__required--' + mark.kind" [attr.aria-hidden]="mark.kind === 'optional' ? null : 'true'">{{ mark.text }}</span>
        }
      </label>
    }
    <div
      class="cb-phone-input__control"
      [class]="'cb-phone-input__control--' + size()"
      [class.cb-is-invalid]="showInvalid()"
      [class.cb-is-disabled]="isDisabled()"
    >
      <button
        #trigger
        type="button"
        class="cb-phone-input__country"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="open() ? listId : null"
        [attr.aria-label]="countryLabel()"
        [disabled]="isDisabled() || countryLocked()"
        (click)="toggle()"
        (keydown.arrowdown)="openFromKeyboard($event)"
      >
        @if (selected(); as c) {
          @if (showFlag()) {
            <span class="cb-phone-input__flag" aria-hidden="true">{{ flag(c) }}</span>
          }
          <span class="cb-phone-input__dial" aria-hidden="true">+{{ c.dial }}</span>
        }
        @if (!countryLocked()) {
          <cb-icon name="chevron-down" [size]="14" aria-hidden="true" />
        }
      </button>
      <input
        #field
        class="cb-phone-input__field"
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
        [id]="inputId"
        [value]="display()"
        [placeholder]="placeholder() ?? examplePlaceholder()"
        [disabled]="isDisabled()"
        [required]="fieldState.required()"
        [attr.aria-invalid]="showInvalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy()"
        (input)="onInput($event)"
        (blur)="onBlur()"
      />
    </div>
    @if (showInvalid() && errorText()) {
      <p class="cb-phone-input__message cb-phone-input__message--error" [id]="inputId + '-error'" role="alert">{{ errorText() }}</p>
    } @else if (hint()) {
      <p class="cb-phone-input__message" [id]="inputId + '-hint'">{{ hint() }}</p>
    }

    <ng-template #panel>
      <div class="cb-phone-input__panel">
        <input
          #search
          class="cb-phone-input__search"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded="true"
          autocomplete="off"
          [attr.aria-controls]="listId"
          [attr.aria-activedescendant]="activeId()"
          [attr.aria-label]="t().searchCountry"
          [placeholder]="t().searchCountry"
          [value]="query()"
          (input)="query.set($any($event.target).value); active.set(0)"
          (keydown)="onSearchKeydown($event)"
        />
        <ul class="cb-phone-input__list" role="listbox" [id]="listId" [attr.aria-label]="t().phoneCountry">
          @for (c of filtered(); track c.iso; let i = $index) {
            <li
              role="option"
              class="cb-phone-input__option"
              [id]="listId + '-' + c.iso"
              [class.cb-phone-input__option--active]="i === active()"
              [attr.aria-selected]="c.iso === selected()?.iso"
              (mousemove)="active.set(i)"
              (mousedown)="$event.preventDefault()"
              (click)="choose(c)"
            >
              @if (showFlag()) {
                <span class="cb-phone-input__flag" aria-hidden="true">{{ flag(c) }}</span>
              }
              <span class="cb-phone-input__name">{{ name(c) }}</span>
              <span class="cb-phone-input__option-dial">+{{ c.dial }}</span>
            </li>
          } @empty {
            <li class="cb-phone-input__empty" role="presentation">{{ t().noResults }}</li>
          }
        </ul>
      </div>
    </ng-template>
  `,
  styleUrl: './phone-input.component.css',
})
export class CbPhoneInput implements ControlValueAccessor, Validator {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly triggerEl = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly fieldEl = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly searchEl = viewChild<ElementRef<HTMLInputElement>>('search');
  private readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;

  protected readonly inputId = `cb-phone-input-${++nextUid}`;
  protected readonly listId = `${this.inputId}-countries`;

  /** Número en formato E.164 (`+573001234567`); `''` si está vacío. */
  readonly value = model<string>('');
  /** País seleccionado (código ISO). */
  readonly country = model<string>('CO');
  /** Países disponibles. Por defecto, `CB_PHONE_COUNTRIES`; puedes pasar otros o filtrar por código ISO. */
  readonly countries = input<readonly (CbPhoneCountry | string)[]>(CB_PHONE_COUNTRIES);
  /** Países que aparecen primero en la lista (código ISO). */
  readonly preferredCountries = input<readonly string[]>([]);
  /** Bloquea el país (solo se escribe el número). */
  readonly countryLocked = input<boolean, unknown>(false, { transform: toBoolean });
  /** Muestra la bandera (emoji). En Windows algunos navegadores la muestran como letras. */
  readonly showFlag = input<boolean, unknown>(true, { transform: toBoolean });
  readonly label = input<string>('');
  readonly hint = input<string>('');
  /** Error a mostrar. Por defecto, "Número de teléfono incompleto o no válido" cuando lo es. */
  readonly error = input<string | undefined>(undefined);
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  readonly required = input<boolean, unknown>(false, { transform: toBoolean });
  readonly requiredIndicator = input<CbRequiredIndicator | undefined>(undefined);
  /** Placeholder. Por defecto, un número de ejemplo del país. */
  readonly placeholder = input<string | undefined>(undefined);
  readonly size = input<CbSize>('md');
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });

  /** Cada cambio con el número E.164, el nacional, el país y si es válido. */
  readonly phoneChange = output<CbPhoneChange>();

  protected readonly fieldState = cbFieldState({
    invalid: () => this.invalid(),
    required: () => this.required(),
    requiredIndicator: () => this.requiredIndicator(),
  });

  /** Número nacional (solo dígitos). */
  private readonly national = signal('');
  private readonly touched = signal(false);
  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly active = signal(0);

  private readonly displayNames = computed(() => {
    try {
      return new Intl.DisplayNames([this.t().intlLocale], { type: 'region' });
    } catch {
      return null;
    }
  });

  protected readonly list = computed<CbPhoneCountry[]>(() => {
    const byIso = new Map(CB_PHONE_COUNTRIES.map((c) => [c.iso, c]));
    const items = this.countries()
      .map((c) => (typeof c === 'string' ? byIso.get(c.toUpperCase()) : c))
      .filter((c): c is CbPhoneCountry => !!c);
    const preferred = this.preferredCountries().map((iso) => iso.toUpperCase());
    const rank = (c: CbPhoneCountry) => {
      const i = preferred.indexOf(c.iso);
      return i < 0 ? preferred.length : i;
    };
    return [...items].sort((a, b) => rank(a) - rank(b) || this.name(a).localeCompare(this.name(b), this.t().intlLocale));
  });

  protected readonly selected = computed<CbPhoneCountry | null>(() => {
    const iso = this.country().toUpperCase();
    return this.list().find((c) => c.iso === iso) ?? this.list()[0] ?? null;
  });

  protected readonly filtered = computed(() => {
    const q = this.normalize(this.query().trim().replace(/^\+/, ''));
    if (!q) return this.list();
    return this.list().filter((c) => this.normalize(this.name(c)).includes(q) || c.dial.startsWith(q) || c.iso.toLowerCase() === q);
  });

  protected readonly activeId = computed(() => {
    const c = this.filtered()[this.active()];
    return c ? `${this.listId}-${c.iso}` : null;
  });

  protected readonly display = computed(() => {
    const c = this.selected();
    return c ? cbFormatNational(c, this.national()) : this.national();
  });

  protected readonly examplePlaceholder = computed(() => {
    const c = this.selected();
    return c?.example ? cbFormatNational(c, c.example) : '';
  });

  protected readonly isValid = computed(() => !this.national() || cbIsValidPhone(this.selected(), this.national()));
  protected readonly showInvalid = computed(() => this.fieldState.invalid() || (this.touched() && !this.isValid()));
  protected readonly errorText = computed(() => this.error() ?? (!this.isValid() ? this.t().phoneInvalid : ''));
  protected readonly countryLabel = computed(() => {
    const c = this.selected();
    return c ? `${this.t().phoneCountry}: ${this.name(c)} (+${c.dial})` : this.t().phoneCountry;
  });
  protected readonly describedBy = computed(() => {
    if (this.showInvalid() && this.errorText()) return `${this.inputId}-error`;
    if (this.hint()) return `${this.inputId}-hint`;
    return null;
  });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};

  constructor() {
    // `[(value)]` fuera de Angular Forms: un valor nuevo desde fuera se interpreta.
    effect(() => {
      const value = this.value();
      untracked(() => {
        if (value !== cbToE164(this.selected(), this.national())) this.applyText(value, false);
      });
    });
  }

  protected flag(c: CbPhoneCountry): string {
    return cbFlagEmoji(c.iso);
  }

  protected name(c: CbPhoneCountry): string {
    return this.displayNames()?.of(c.iso) ?? c.iso;
  }

  private normalize(text: string): string {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  // --- ControlValueAccessor / Validator --------------------------------------
  writeValue(value: string | null): void {
    this.applyText(value ?? '', false);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  validate(_control: AbstractControl): ValidationErrors | null {
    return this.isValid() ? null : { phone: true };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  // --- Número ------------------------------------------------------------------
  protected onInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    // Posición del cursor contada en dígitos, para restaurarla tras reformatear.
    const caretDigits = el.value.slice(0, el.selectionStart ?? el.value.length).replace(/\D/g, '').length;
    this.applyText(el.value, true);
    const formatted = this.display();
    el.value = formatted;
    let pos = 0;
    for (let seen = 0; pos < formatted.length && seen < caretDigits; pos++) if (/\d/.test(formatted[pos])) seen++;
    el.setSelectionRange?.(pos, pos);
  }

  protected onBlur(): void {
    this.touched.set(true);
    this.onTouched();
  }

  /** Interpreta texto escrito, pegado o recibido (E.164 o nacional). */
  private applyText(text: string, emit: boolean): void {
    const parsed = cbParsePhone(text, this.selected(), this.list());
    if (parsed.country && parsed.country.iso !== this.selected()?.iso) this.country.set(parsed.country.iso);
    const country = parsed.country ?? this.selected();
    const max = country ? Math.max(...country.lengths) : 15;
    this.national.set(parsed.national.slice(0, max));
    this.publish(emit);
  }

  private publish(emit: boolean): void {
    const country = this.selected();
    const national = this.national();
    const e164 = cbToE164(country, national);
    this.value.set(e164);
    this.onValidatorChange();
    if (!emit) return;
    this.onChange(e164);
    this.phoneChange.emit({ e164, national, country: country?.iso ?? '', valid: !!national && cbIsValidPhone(country, national) });
  }

  // --- Selector de país ------------------------------------------------------------
  toggle(): void {
    if (this.open()) this.close();
    else this.openPanel();
  }

  protected openFromKeyboard(event: Event): void {
    event.preventDefault();
    if (!this.open()) this.openPanel();
  }

  private openPanel(): void {
    if (this.overlayRef || this.isDisabled() || this.countryLocked()) return;
    this.query.set('');
    const index = this.list().findIndex((c) => c.iso === this.selected()?.iso);
    this.active.set(Math.max(0, index));
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.triggerEl().nativeElement)
        .withPositions([
          { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
          { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
        ])
        .withPush(true),
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.open.set(true);
    afterNextRender(
      () => {
        this.searchEl()?.nativeElement.focus();
        this.scrollActiveIntoView();
      },
      { injector: this.injector },
    );
  }

  /** Cierra la lista de países. */
  close(focusTrigger = true): void {
    if (!this.overlayRef) return;
    this.overlayRef.dispose();
    this.overlayRef = null;
    this.open.set(false);
    if (focusTrigger) this.triggerEl().nativeElement.focus();
  }

  protected choose(c: CbPhoneCountry): void {
    this.country.set(c.iso);
    this.national.set(this.national().slice(0, Math.max(...c.lengths)));
    this.close(false);
    this.publish(true);
    this.fieldEl().nativeElement.focus();
  }

  protected onSearchKeydown(event: KeyboardEvent): void {
    const count = this.filtered().length;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (!count) return;
        this.active.set((this.active() + (event.key === 'ArrowDown' ? 1 : -1) + count) % count);
        this.scrollActiveIntoView();
        break;
      case 'Enter': {
        event.preventDefault();
        const c = this.filtered()[this.active()];
        if (c) this.choose(c);
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close(false);
        break;
    }
  }

  private scrollActiveIntoView(): void {
    const id = this.activeId();
    afterNextRender(() => (id ? this.overlayRef?.overlayElement.querySelector(`#${id}`)?.scrollIntoView?.({ block: 'nearest' }) : null), {
      injector: this.injector,
    });
  }
}
