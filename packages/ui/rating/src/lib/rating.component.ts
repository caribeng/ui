import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { CbIcon } from '@caribeng/ui/icon';
import { cbFormat, cbFieldState, type CbSize, injectCbTranslation } from '@caribeng/ui';

let nextUid = 0;

/**
 * Valoración con estrellas de CaribeNG, integrada con Angular Forms vía
 * `ControlValueAccessor`. El modelo es un número (0..stars).
 *
 * @example
 * ```html
 * <cb-rating formControlName="puntuacion" [stars]="5" />
 * ```
 */
@Component({
  selector: 'cb-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-rating',
    '[class.cb-is-invalid]': 'fieldState.invalid()',
    '[attr.aria-invalid]': "fieldState.invalid() ? 'true' : null",
    role: 'slider',
    'aria-valuemin': '0',
    '[attr.aria-valuemax]': 'stars()',
    '[attr.aria-valuenow]': 'value()',
    '[attr.aria-valuetext]': 'fmt(t().ratingOf, value(), stars())',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.tabindex]': 'isDisabled() || readonly() ? null : 0',
    '[class.cb-is-disabled]': 'isDisabled()',
    '[class.cb-is-readonly]': 'readonly()',
    '(keydown)': 'onKeydown($event)',
    '(blur)': 'onBlur()',
    '(mouseleave)': 'hover.set(0)',
  },
  template: `
    @for (i of starList(); track i) {
      <!-- Las estrellas son decorativas: el control accesible es el propio slider (sin controles anidados). -->
      <span
        class="cb-rating__star"
        [class]="'cb-rating__star--' + size()"
        [class.cb-rating__star--on]="i <= display()"
        aria-hidden="true"
        (click)="isDisabled() || readonly() || pick(i)"
        (mouseenter)="hover.set(i)"
      >
        <cb-icon name="star" [size]="iconPx()" />
      </span>
    }
  `,
  styleUrl: './rating.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbRating),
      multi: true,
    },
  ],
})
export class CbRating implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  /** Valor seleccionado (two-way opcional fuera de Angular Forms). */
  readonly value = model<number>(0);

  /** Número de estrellas. */
  readonly stars = input<number>(5);
  /** Tamaño. */
  readonly size = input<CbSize>('md');
  /** Solo lectura (no editable, pero muestra el valor). */
  readonly readonly = input<boolean, unknown>(false, { transform: toBoolean });
  /** Deshabilitado declarativo (se combina con Angular Forms). */
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });
  /** Etiqueta accesible del control. */
  readonly ariaLabel = input<string>('');
  /** Id (reservado para uso futuro / asociación de label externa). */
  readonly inputId = input<string>(`cb-rating-${++nextUid}`);

  /** Emite el nuevo valor al cambiar. */
  readonly changed = output<number>();

  protected readonly hover = signal(0);
  protected readonly display = computed(() => this.hover() || this.value());

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  protected readonly starList = computed(() =>
    Array.from({ length: this.stars() }, (_, i) => i + 1),
  );
  protected readonly iconPx = computed(
    () => ({ sm: 16, md: 20, lg: 28 })[this.size()] ?? 20,
  );

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: number | null): void {
    this.value.set(typeof value === 'number' && value >= 0 ? value : 0);
  }
  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Interacción -----------------------------------------------------------
  protected pick(i: number): void {
    if (this.isDisabled() || this.readonly()) return;
    // Volver a hacer clic en el valor actual lo limpia (0).
    this.commit(this.value() === i ? 0 : i);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.readonly()) return;
    const max = this.stars();
    let next = this.value();
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = Math.min(max, next + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = Math.max(0, next - 1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.commit(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  private commit(next: number): void {
    if (next === this.value()) return;
    this.value.set(next);
    this.onChange(next);
    this.changed.emit(next);
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
