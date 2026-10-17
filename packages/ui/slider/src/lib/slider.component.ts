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
import type { CbSize } from '@caribeng/ui';

let nextUid = 0;

/**
 * Control deslizante (slider) de CaribeNG, integrado con Angular Forms vía
 * `ControlValueAccessor`. Soporta arrastre con puntero y navegación por teclado.
 *
 * @example
 * ```html
 * <cb-slider formControlName="volumen" [min]="0" [max]="100" [step]="5" />
 * ```
 */
@Component({
  selector: 'cb-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-slider',
    '[class]': "'cb-slider--' + size()",
    '[class.cb-is-disabled]': 'isDisabled()',
  },
  template: `
    <div
      #track
      class="cb-slider__track"
      (pointerdown)="onPointerDown($event)"
    >
      <div class="cb-slider__range" [style.width.%]="percent()"></div>
      <div
        class="cb-slider__thumb"
        [style.left.%]="percent()"
        role="slider"
        [attr.tabindex]="isDisabled() ? -1 : 0"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuemax]="max()"
        [attr.aria-valuenow]="value()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-disabled]="isDisabled() ? 'true' : null"
        (keydown)="onKeydown($event)"
        (blur)="onTouched()"
      ></div>
    </div>
  `,
  styleUrl: './slider.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbSliderComponent),
      multi: true,
    },
  ],
})
export class CbSliderComponent implements ControlValueAccessor {
  readonly value = model<number>(0);

  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly step = input<number>(1);
  readonly size = input<CbSize>('md');
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  readonly ariaLabel = input<string>('');
  readonly inputId = input<string>(`cb-slider-${++nextUid}`);

  readonly changed = output<number>();

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private dragging = false;

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  protected readonly percent = computed(() => {
    const span = this.max() - this.min();
    if (span <= 0) return 0;
    return Math.min(100, Math.max(0, ((this.value() - this.min()) / span) * 100));
  });

  private onChange: (value: number) => void = () => {};
  protected onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: number | null): void {
    this.value.set(this.clampSnap(typeof value === 'number' ? value : this.min()));
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

  // --- Puntero ---------------------------------------------------------------
  protected onPointerDown(event: PointerEvent): void {
    if (this.isDisabled()) return;
    event.preventDefault();
    this.dragging = true;
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    this.updateFromClientX(event.clientX);

    const move = (e: PointerEvent) => {
      if (this.dragging) this.updateFromClientX(e.clientX);
    };
    const up = () => {
      this.dragging = false;
      this.onTouched();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  private updateFromClientX(clientX: number): void {
    const rect = this.track().nativeElement.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const raw = this.min() + ratio * (this.max() - this.min());
    this.commit(this.clampSnap(raw));
  }

  // --- Teclado ---------------------------------------------------------------
  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;
    const step = this.step();
    let next = this.value();
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
    this.commit(this.clampSnap(next));
  }

  // --- Helpers ---------------------------------------------------------------
  private clampSnap(n: number): number {
    const min = this.min();
    const max = this.max();
    const step = this.step() || 1;
    const snapped = Math.round((n - min) / step) * step + min;
    return Math.min(max, Math.max(min, Number(snapped.toFixed(10))));
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
