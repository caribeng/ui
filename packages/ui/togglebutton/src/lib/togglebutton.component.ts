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
import { cbFieldState, type CbSize, injectCbTranslation } from '@caribeng/ui';

let nextUid = 0;

/**
 * ToggleButton de CaribeNG: botón de dos estados (on/off) con etiqueta/icono
 * por estado. Integrado con Angular Forms vía `ControlValueAccessor` (boolean).
 *
 * @example
 * ```html
 * <cb-togglebutton onLabel="Activado" offLabel="Desactivado" formControlName="wifi" />
 * ```
 */
@Component({
  selector: 'cb-togglebutton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-togglebutton-host' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbToggleButton),
      multi: true,
    },
  ],
  template: `
    <button
      type="button"
      class="cb-togglebutton"
      [class.cb-is-invalid]="fieldState.invalid()"
      [class]="'cb-togglebutton--' + size()"
      [class.cb-is-on]="checked()"
      [id]="inputId()"
      [attr.aria-pressed]="checked()"
      [attr.aria-label]="ariaLabel() || null"
      [disabled]="isDisabled()"
      (click)="toggle()"
      (blur)="onTouched()"
    >
      @if (icon()) {
        <cb-icon [name]="icon()" [size]="16" aria-hidden="true" />
      }
      <span class="cb-togglebutton__label">{{ label() }}</span>
    </button>
  `,
  styleUrl: './togglebutton.component.css',
})
export class CbToggleButton implements ControlValueAccessor {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly onLabel = input<string | undefined>(undefined);
  readonly offLabel = input<string | undefined>(undefined);
  readonly onIcon = input<string>('');
  readonly offIcon = input<string>('');
  readonly size = input<CbSize>('md');
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  /** Marca visual y ARIA de estado inválido (también se activa con Angular Forms). */
  readonly invalid = input<boolean, unknown>(false, { transform: toBoolean });
  /** Estado de validación: inputs manuales + estado de Angular Forms. */
  protected readonly fieldState = cbFieldState({ invalid: () => this.invalid() });
  readonly ariaLabel = input<string>('');
  readonly inputId = input<string>(`cb-togglebutton-${++nextUid}`);

  readonly value = model<boolean>(false);
  readonly changed = output<boolean>();

  protected readonly checked = computed(() => this.value());
  protected readonly label = computed(() => (this.value() ? (this.onLabel() ?? this.t().yes) : (this.offLabel() ?? this.t().no)));
  protected readonly icon = computed(() => (this.value() ? this.onIcon() : this.offIcon()));

  private readonly cvaDisabled = signal(false);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );

  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: boolean | null): void {
    this.value.set(!!value);
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected toggle(): void {
    if (this.isDisabled()) return;
    const next = !this.value();
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
    this.changed.emit(next);
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
