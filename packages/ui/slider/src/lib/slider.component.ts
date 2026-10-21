import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { cbFieldState, type CbSize, injectCbTranslation } from '@caribeng/ui';

let nextUid = 0;

/** Rango del slider: `[mínimo, máximo]`. */
export type CbSliderRange = readonly [number, number];

/** Formato del valor: opciones de `Intl.NumberFormat` o una función propia. */
export type CbSliderValueFormat = Intl.NumberFormatOptions | ((value: number) => string);

/**
 * Control deslizante (slider) de CaribeNG, integrado con Angular Forms vía
 * `ControlValueAccessor`. Soporta arrastre con puntero, teclado y un modo de
 * rango con dos tiradores (patrón WAI-ARIA *multi-thumb slider*).
 *
 * - Un valor: `[(value)]` (número).
 * - Rango: `range` + `[(rangeValue)]` (`[mínimo, máximo]`). Con Angular Forms,
 *   el control recibe el número o el par según el modo.
 *
 * @example
 * ```html
 * <cb-slider formControlName="volumen" [min]="0" [max]="100" [step]="5" ariaLabel="Volumen" />
 * <cb-slider range [(rangeValue)]="precio" [min]="0" [max]="2000000" [step]="50000"
 *            [valueFormat]="{ style: 'currency', currency: 'COP', maximumFractionDigits: 0 }" showValue ariaLabel="Precio" />
 * ```
 */
@Component({
  selector: 'cb-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-slider',
    '[class.cb-is-invalid]': 'fieldState.invalid()',
    '[class]': "'cb-slider--' + size()",
    '[class.cb-is-disabled]': 'isDisabled()',
    '[class.cb-slider--with-value]': 'showValue()',
  },
  template: `
    <div #track class="cb-slider__track" (pointerdown)="onPointerDown($event)">
      <div class="cb-slider__range" [style.left.%]="range() ? lowPercent() : 0" [style.width.%]="range() ? highPercent() - lowPercent() : highPercent()"></div>
      @for (thumb of thumbs(); track thumb.index) {
        <div
          class="cb-slider__thumb"
          [class.cb-is-active]="activeThumb() === thumb.index"
          [style.left.%]="thumb.percent"
          role="slider"
          [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
          [attr.tabindex]="isDisabled() ? -1 : 0"
          [attr.aria-valuemin]="thumb.min"
          [attr.aria-valuemax]="thumb.max"
          [attr.aria-valuenow]="thumb.value"
          [attr.aria-valuetext]="valueFormat() ? thumb.text : null"
          [attr.aria-label]="thumb.label || null"
          [attr.aria-disabled]="isDisabled() ? 'true' : null"
          (keydown)="onKeydown($event, thumb.index)"
          (focus)="activeThumb.set(thumb.index)"
          (blur)="onTouched()"
        >
          @if (showValue()) {
            <span class="cb-slider__value" aria-hidden="true">{{ thumb.text }}</span>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './slider.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbSlider),
      multi: true,
    },
  ],
})
export class CbSlider implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Valor en modo de un tirador. */
  readonly value = model<number>(0);
  /** Valor en modo `range`: `[mínimo, máximo]`. */
  readonly rangeValue = model<CbSliderRange>([0, 100]);

  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly step = input<number>(1);
  readonly size = input<CbSize>('md');
  /** Dos tiradores para elegir un rango (`[(rangeValue)]`). */
  readonly range = input(false, { transform: booleanAttribute });
  /** Muestra el valor encima de cada tirador. */
  readonly showValue = input(false, { transform: booleanAttribute });
  /** Formato del valor (texto visible y `aria-valuetext`). */
  readonly valueFormat = input<CbSliderValueFormat | undefined>(undefined);
  /** Locale BCP 47 del formato (por defecto, el del navegador). */
  readonly locale = input<string | undefined>(undefined);
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });
  /** Nombre accesible; en modo rango se completa con "Mínimo" / "Máximo". */
  readonly ariaLabel = input<string>('');
  readonly inputId = input<string>(`cb-slider-${++nextUid}`);

  /** Valor nuevo (número o rango) cada vez que cambia. */
  readonly changed = output<number>();
  readonly rangeChanged = output<CbSliderRange>();

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  /** Tirador que se arrastra o se movió por última vez (0 = mínimo, 1 = máximo). */
  protected readonly activeThumb = signal<0 | 1>(0);

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private readonly formatter = computed(() => {
    const vf = this.valueFormat();
    return typeof vf === 'function' ? vf : new Intl.NumberFormat(this.locale(), vf).format;
  });

  protected readonly lowPercent = computed(() => this.percentOf(this.range() ? this.rangeValue()[0] : this.min()));
  protected readonly highPercent = computed(() => this.percentOf(this.range() ? this.rangeValue()[1] : this.value()));

  /** Datos de cada tirador: en rango, los límites de uno dependen del otro (no se cruzan). */
  protected readonly thumbs = computed(() => {
    const fmt = this.formatter();
    const label = this.ariaLabel();
    if (!this.range()) {
      const v = this.value();
      return [{ index: 0 as const, value: v, min: this.min(), max: this.max(), percent: this.percentOf(v), text: fmt(v), label }];
    }
    const [lo, hi] = this.rangeValue();
    return [
      { index: 0 as const, value: lo, min: this.min(), max: hi, percent: this.percentOf(lo), text: fmt(lo), label: joinLabel(label, this.t().minimum) },
      { index: 1 as const, value: hi, min: lo, max: this.max(), percent: this.percentOf(hi), text: fmt(hi), label: joinLabel(label, this.t().maximum) },
    ];
  });

  private onChange: (value: number | CbSliderRange) => void = () => {};
  protected onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: number | CbSliderRange | null): void {
    if (Array.isArray(value)) {
      const lo = this.clampSnap(value[0] ?? this.min());
      const hi = this.clampSnap(value[1] ?? this.max());
      this.rangeValue.set([Math.min(lo, hi), Math.max(lo, hi)]);
    } else {
      this.value.set(this.clampSnap(typeof value === 'number' ? value : this.min()));
    }
  }
  registerOnChange(fn: (value: number | CbSliderRange) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  // --- Puntero ---------------------------------------------------------------
  protected onPointerDown(event: PointerEvent): void {
    if (this.isDisabled()) return;
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    // En rango se arrastra el tirador más cercano al punto pulsado.
    const thumb = this.range() ? this.nearestThumb(event.clientX) : 0;
    this.activeThumb.set(thumb);
    this.updateFromClientX(event.clientX, thumb);

    const move = (e: PointerEvent) => this.updateFromClientX(e.clientX, thumb);
    const up = () => {
      this.onTouched();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  private valueAtClientX(clientX: number): number | null {
    const rect = this.track().nativeElement.getBoundingClientRect();
    if (rect.width <= 0) return null;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return this.min() + ratio * (this.max() - this.min());
  }

  private nearestThumb(clientX: number): 0 | 1 {
    const v = this.valueAtClientX(clientX);
    if (v === null) return this.activeThumb();
    const [lo, hi] = this.rangeValue();
    if (lo === hi) return v > hi ? 1 : 0;
    return Math.abs(v - lo) <= Math.abs(v - hi) ? 0 : 1;
  }

  private updateFromClientX(clientX: number, thumb: 0 | 1): void {
    const v = this.valueAtClientX(clientX);
    if (v !== null) this.setThumb(thumb, this.clampSnap(v));
  }

  // --- Teclado ---------------------------------------------------------------
  protected onKeydown(event: KeyboardEvent, thumb: 0 | 1): void {
    if (this.isDisabled()) return;
    const step = this.step();
    const current = this.range() ? this.rangeValue()[thumb] : this.value();
    let next = current;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next += step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next -= step;
        break;
      case 'PageUp':
        next += step * 10;
        break;
      case 'PageDown':
        next -= step * 10;
        break;
      case 'Home':
        next = this.min();
        break;
      case 'End':
        next = this.max();
        break;
      default:
        return;
    }
    event.preventDefault();
    this.activeThumb.set(thumb);
    this.setThumb(thumb, this.clampSnap(next));
  }

  // --- Helpers ---------------------------------------------------------------
  private percentOf(v: number): number {
    const span = this.max() - this.min();
    if (span <= 0) return 0;
    return Math.min(100, Math.max(0, ((v - this.min()) / span) * 100));
  }

  private clampSnap(n: number): number {
    const min = this.min();
    const max = this.max();
    const step = this.step() || 1;
    const snapped = Math.round((n - min) / step) * step + min;
    return Math.min(max, Math.max(min, Number(snapped.toFixed(10))));
  }

  /** Mueve un tirador sin cruzar el otro y avisa del cambio. */
  private setThumb(thumb: 0 | 1, next: number): void {
    if (!this.range()) {
      if (next === this.value()) return;
      this.value.set(next);
      this.onChange(next);
      this.changed.emit(next);
      return;
    }
    const [lo, hi] = this.rangeValue();
    const updated: CbSliderRange = thumb === 0 ? [Math.min(next, hi), hi] : [lo, Math.max(next, lo)];
    if (updated[0] === lo && updated[1] === hi) return;
    this.rangeValue.set(updated);
    this.onChange(updated);
    this.rangeChanged.emit(updated);
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}

function joinLabel(label: string, suffix: string): string {
  return label ? `${label} ${suffix.toLocaleLowerCase()}` : suffix;
}
