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
import { cbFieldState, type CbSeverity } from '@caribeng/ui';

let nextUid = 0;

const R = 42;
const C = 2 * Math.PI * R;
const SWEEP = 270; // grados del arco (hueco inferior de 90°)
const START = 135; // ángulo de pantalla donde empieza el arco (abajo-izquierda)

/**
 * Knob de CaribeNG: dial circular para elegir un número. Arrastre con puntero y
 * teclado. Integrado con Angular Forms vía `ControlValueAccessor`.
 *
 * @example
 * ```html
 * <cb-knob formControlName="volumen" [min]="0" [max]="100" suffix="%" />
 * ```
 */
@Component({
  selector: 'cb-knob',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-knob',
    '[class.cb-is-invalid]': 'fieldState.invalid()',
    '[class]': "'cb-knob cb-knob--' + severity()",
    '[class.cb-is-disabled]': 'isDisabled()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbKnob),
      multi: true,
    },
  ],
  template: `
    <svg
      #svg
      class="cb-knob__svg"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 100 100"
      role="slider"
      [attr.aria-invalid]="fieldState.invalid() ? 'true' : null"
      [attr.tabindex]="isDisabled() ? -1 : 0"
      [attr.aria-valuemin]="min()"
      [attr.aria-valuemax]="max()"
      [attr.aria-valuenow]="value()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-disabled]="isDisabled() ? 'true' : null"
      (pointerdown)="onPointerDown($event)"
      (keydown)="onKeydown($event)"
      (blur)="onTouched()"
    >
      <circle
        class="cb-knob__track"
        cx="50" cy="50" [attr.r]="r"
        fill="none"
        [attr.stroke-width]="strokeWidth()"
        [attr.stroke-dasharray]="trackDash"
        transform="rotate(135 50 50)"
      />
      <circle
        class="cb-knob__range"
        cx="50" cy="50" [attr.r]="r"
        fill="none"
        stroke-linecap="round"
        [attr.stroke-width]="strokeWidth()"
        [attr.stroke-dasharray]="rangeDash()"
        transform="rotate(135 50 50)"
      />
      @if (showValue()) {
        <text class="cb-knob__text" x="50" y="50" text-anchor="middle" dominant-baseline="central">
          {{ value() }}{{ suffix() }}
        </text>
      }
    </svg>
  `,
  styleUrl: './knob.component.css',
})
export class CbKnob implements ControlValueAccessor {
  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly step = input<number>(1);
  readonly size = input<number>(100);
  readonly strokeWidth = input<number>(12);
  readonly severity = input<CbSeverity>('primary');
  readonly showValue = input<boolean, unknown>(true, { transform: toBoolean });
  /** Sufijo del texto central (p. ej. `%`). */
  readonly suffix = input<string>('');
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });
  readonly ariaLabel = input<string>('');
  readonly inputId = input<string>(`cb-knob-${++nextUid}`);

  readonly value = model<number>(0);
  readonly changed = output<number>();

  protected readonly r = R;
  protected readonly trackDash = `${(C * SWEEP) / 360} ${C}`;

  private readonly svg = viewChild.required<ElementRef<SVGElement>>('svg');

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  private readonly pct = computed(() => {
    const span = this.max() - this.min();
    if (span <= 0) return 0;
    return Math.min(1, Math.max(0, (this.value() - this.min()) / span));
  });
  protected readonly rangeDash = computed(() => `${(C * SWEEP * this.pct()) / 360} ${C}`);

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
    (event.target as Element).setPointerCapture?.(event.pointerId);
    this.updateFromPoint(event.clientX, event.clientY);
    const move = (e: PointerEvent) => this.updateFromPoint(e.clientX, e.clientY);
    const up = () => {
      this.onTouched();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  private updateFromPoint(clientX: number, clientY: number): void {
    const rect = this.svg().nativeElement.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let a = (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
    if (a < 0) a += 360;
    if (a < START) a += 360; // región inferior-derecha
    a = Math.min(START + SWEEP, Math.max(START, a));
    const pct = (a - START) / SWEEP;
    this.commit(this.clampSnap(this.min() + pct * (this.max() - this.min())));
  }

  // --- Teclado ---------------------------------------------------------------
  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;
    const step = this.step();
    let next = this.value();
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp': next += step; break;
      case 'ArrowLeft':
      case 'ArrowDown': next -= step; break;
      case 'Home': next = this.min(); break;
      case 'End': next = this.max(); break;
      default: return;
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
