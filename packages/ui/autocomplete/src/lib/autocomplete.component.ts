import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { OverlayModule, type ConnectedPosition } from '@angular/cdk/overlay';
import { cbFieldState, type CbRequiredIndicator, type CbSize, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

let nextUid = 0;

/**
 * Autocomplete de CaribeNG. Campo de texto con sugerencias en un panel sobre
 * CDK Overlay. El filtrado lo resuelve el consumidor escuchando `(complete)` y
 * actualizando `suggestions` (patrón asíncrono, apto para peticiones remotas).
 *
 * @example
 * ```html
 * <cb-autocomplete
 *   formControlName="pais"
 *   [suggestions]="filtrados()"
 *   optionLabel="nombre"
 *   (complete)="buscar($event)"
 *   placeholder="Escribe un país" />
 * ```
 */
@Component({
  selector: 'cb-autocomplete',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [OverlayModule, CbIcon],
  host: { class: 'cb-autocomplete-host' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbAutocomplete),
      multi: true,
    },
  ],
  template: `
    @if (label()) {
      <label class="cb-autocomplete__label" [attr.for]="inputId()">
        {{ label() }}
        @if (fieldState.indicator(); as mark) {
          <span
            [class]="'cb-autocomplete__required cb-autocomplete__required--' + mark.kind"
            [attr.aria-hidden]="mark.kind === 'optional' ? null : 'true'"
          >{{ mark.text }}</span>
        }
      </label>
    }

    <div
      #trigger
      class="cb-autocomplete"
      [class]="'cb-autocomplete--' + size()"
      [class.cb-is-open]="open()"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class.cb-is-disabled]="isDisabled()"
      [class.cb-autocomplete--dropdown]="dropdown()"
    >
      <input
        #field
        class="cb-autocomplete__field"
        [id]="inputId()"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        [attr.aria-expanded]="open()"
        [attr.aria-controls]="listboxId"
        [attr.aria-activedescendant]="activeDescendant()"
        [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
        [attr.aria-describedby]="describedBy()"
        [value]="query()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [required]="fieldState.required()"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        (keydown)="onKeydown($event)"
      />
      @if (dropdown()) {
        <button
          type="button"
          class="cb-autocomplete__dropdown-btn"
          tabindex="-1"
          [attr.aria-label]="t().showSuggestions"
          [disabled]="isDisabled()"
          (click)="onDropdownClick()"
        >
          <cb-icon name="chevron-down" [size]="16" aria-hidden="true" />
        </button>
      }
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayWidth]="triggerWidth()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayHasBackdrop]="false"
      (overlayOutsideClick)="close()"
      (detach)="close()"
    >
      <div class="cb-autocomplete__panel">
        <ul class="cb-autocomplete__list" role="listbox" [id]="listboxId">
          @for (opt of suggestions(); track trackOption(opt, $index); let i = $index) {
            <li
              class="cb-autocomplete__option"
              [class.cb-is-active]="i === activeIndex()"
              role="option"
              [id]="optionId(i)"
              [attr.aria-selected]="i === activeIndex()"
              (mousedown)="$event.preventDefault()"
              (click)="selectOption(opt)"
              (mouseenter)="activeIndex.set(i)"
            >
              {{ labelOf(opt) }}
            </li>
          } @empty {
            <li class="cb-autocomplete__empty" role="option" aria-disabled="true">
              {{ (emptyMessage() ?? t().noResults) }}
            </li>
          }
        </ul>
      </div>
    </ng-template>

    @if (fieldState.invalid() && error()) {
      <p class="cb-autocomplete__message cb-autocomplete__message--error" [id]="errorId()" role="alert">
        {{ error() }}
      </p>
    } @else if (hint()) {
      <p class="cb-autocomplete__message cb-autocomplete__message--hint" [id]="hintId()">
        {{ hint() }}
      </p>
    }
  `,
  styleUrl: './autocomplete.component.css',
})
export class CbAutocomplete implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Valor seleccionado (two-way opcional fuera de Angular Forms). */
  readonly value = model<unknown>(null);

  /** Sugerencias a mostrar (las provee y filtra el consumidor). */
  readonly suggestions = input<readonly unknown[]>([]);
  readonly optionLabel = input<string>('label');
  readonly optionValue = input<string | null>(null);
  readonly placeholder = input<string>('');
  readonly size = input<CbSize>('md');
  /** Caracteres mínimos para disparar `complete`. */
  readonly minLength = input<number>(1);
  /** Debounce (ms) antes de emitir `complete`. */
  readonly delay = input<number>(300);
  /** Exige elegir una opción de la lista (si no, al salir se limpia). */
  readonly forceSelection = input<boolean, unknown>(true, { transform: toBoolean });
  /** Muestra un botón para desplegar todas las sugerencias. */
  readonly dropdown = input<boolean, unknown>(false, { transform: toBoolean });
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  readonly required = input<boolean, unknown>(false, { transform: toBoolean });
  /** Indicador de obligatoriedad de este campo; si se omite usa el global de `provideCaribeNG()`. */
  readonly requiredIndicator = input<CbRequiredIndicator | undefined>(undefined);
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({
    invalid: () => this.invalid(),
    required: () => this.required(),
    requiredIndicator: () => this.requiredIndicator(),
  });
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  readonly inputId = input<string>(`cb-autocomplete-${++nextUid}`);

  /** Emite el texto de búsqueda para que el consumidor filtre. */
  readonly complete = output<string>();
  /** Emite la opción elegida. */
  readonly optionSelected = output<unknown>();

  protected readonly query = signal<string>('');
  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly triggerWidth = signal<number>(0);

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly triggerRef = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private readonly fieldRef = viewChild.required<ElementRef<HTMLInputElement>>('field');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  protected readonly listboxId = `${this.inputId()}-listbox`;
  protected readonly errorId = computed(() => `${this.inputId()}-error`);
  protected readonly hintId = computed(() => `${this.inputId()}-hint`);
  protected readonly describedBy = computed(() => {
    if (this.fieldState.invalid() && this.error()) return this.errorId();
    if (this.hint()) return this.hintId();
    return null;
  });

  protected readonly activeDescendant = computed(() =>
    this.open() && this.activeIndex() >= 0 ? this.optionId(this.activeIndex()) : null,
  );

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  ];

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: unknown): void {
    this.value.set(value ?? null);
    this.query.set(this.displayForValue(value));
  }
  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Interacción -----------------------------------------------------------
  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.query.set(text);
    if (text.length >= this.minLength()) {
      this.scheduleComplete(text);
    } else {
      this.close();
    }
  }

  protected onFocus(): void {
    if (this.query().length >= this.minLength() && this.suggestions().length) {
      this.openPanel();
    }
  }

  protected onBlur(): void {
    if (this.forceSelection() && !this.matchesSelection()) {
      // El texto no corresponde a una selección válida: se revierte.
      this.query.set(this.displayForValue(this.value()));
    } else if (!this.forceSelection()) {
      // Modo texto libre: el valor es el texto escrito.
      this.setValue(this.query());
    }
    this.close();
    this.onTouched();
  }

  protected onDropdownClick(): void {
    if (this.isDisabled()) return;
    this.fieldRef().nativeElement.focus();
    this.complete.emit(this.query());
    this.openPanel();
  }

  protected selectOption(opt: unknown): void {
    this.query.set(this.labelOf(opt));
    this.setValue(this.valueOf(opt));
    this.optionSelected.emit(opt);
    this.close();
    queueMicrotask(() => this.fieldRef().nativeElement.focus());
  }

  protected onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open() && this.suggestions().length) this.openPanel();
        this.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(-1);
        break;
      case 'Enter': {
        const opt = this.suggestions()[this.activeIndex()];
        if (this.open() && opt !== undefined) {
          event.preventDefault();
          this.selectOption(opt);
        }
        break;
      }
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.close();
        }
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  // --- Internos --------------------------------------------------------------
  private scheduleComplete(text: string): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.complete.emit(text);
      this.openPanel();
    }, this.delay());
  }

  private openPanel(): void {
    this.triggerWidth.set(this.triggerRef().nativeElement.offsetWidth);
    this.open.set(true);
    this.activeIndex.set(this.suggestions().length ? 0 : -1);
  }

  protected close(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.open.set(false);
    this.activeIndex.set(-1);
  }

  private setValue(value: unknown): void {
    this.value.set(value);
    this.onChange(value);
  }

  private move(delta: number): void {
    const n = this.suggestions().length;
    if (n === 0) return;
    const next = (this.activeIndex() + delta + n) % n;
    this.activeIndex.set(next);
  }

  private matchesSelection(): boolean {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      // Campo vacío: se considera "sin selección" y se limpia el valor.
      if (this.value() != null) this.setValue(null);
      return true;
    }
    return this.suggestions().some((o) => this.labelOf(o).toLowerCase() === q);
  }

  private displayForValue(value: unknown): string {
    if (value == null) return '';
    const key = this.optionValue();
    const match = this.suggestions().find((o) => this.valueOf(o) === value);
    if (match) return this.labelOf(match);
    // Si el valor es un objeto-opción, intenta su label; si no, su texto.
    if (!key && typeof value === 'object') return this.labelOf(value);
    return String(value);
  }

  // --- Helpers ---------------------------------------------------------------
  protected labelOf(opt: unknown): string {
    const key = this.optionLabel();
    if (opt != null && typeof opt === 'object' && key in (opt as object)) {
      return String((opt as Record<string, unknown>)[key]);
    }
    return String(opt);
  }

  protected valueOf(opt: unknown): unknown {
    const key = this.optionValue();
    if (key && opt != null && typeof opt === 'object') {
      return (opt as Record<string, unknown>)[key];
    }
    return opt;
  }

  protected optionId(index: number): string {
    return `${this.inputId()}-opt-${index}`;
  }

  protected trackOption(opt: unknown, index: number): unknown {
    return this.optionValue() ? this.valueOf(opt) : index;
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
