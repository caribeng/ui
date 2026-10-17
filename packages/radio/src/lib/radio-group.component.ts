import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import type { CbSize } from '@caribeng/core';

let nextUid = 0;

/**
 * Grupo de radios de CaribeNG. Es el `ControlValueAccessor`: enlázalo con
 * `formControlName`/`ngModel` y coloca dentro varios `<cb-radio>`.
 *
 * @example
 * ```html
 * <cb-radio-group formControlName="plan" ariaLabel="Plan">
 *   <cb-radio value="free" label="Gratis" />
 *   <cb-radio value="pro" label="Pro" />
 * </cb-radio-group>
 * ```
 */
@Component({
  selector: 'cb-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-radio-group',
    role: 'radiogroup',
    '[class.cb-radio-group--horizontal]': "orientation() === 'horizontal'",
    '[attr.aria-label]': 'ariaLabel() || null',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CbRadioGroupComponent),
      multi: true,
    },
  ],
  template: `<ng-content />`,
  styleUrl: './radio-group.component.css',
})
export class CbRadioGroupComponent implements ControlValueAccessor {
  /** `aria-label` del grupo (recomendado para accesibilidad). */
  readonly ariaLabel = input<string>('');
  /** Nombre compartido por los radios nativos; se genera uno si se omite. */
  readonly name = input<string>(`cb-radio-group-${++nextUid}`);
  /** Tamaño aplicado a los radios hijos. */
  readonly size = input<CbSize>('md');
  /** Disposición de los items. */
  readonly orientation = input<'vertical' | 'horizontal'>('vertical');
  /** Deshabilita todo el grupo. */
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });

  /** Emite el nuevo valor seleccionado. */
  readonly changed = output<unknown>();

  /** Valor seleccionado (lectura para los hijos). */
  readonly value = signal<unknown>(null);

  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  /** Un radio hijo verifica si le corresponde estar marcado. */
  isSelected(value: unknown): boolean {
    return this.value() === value;
  }

  /** Un radio hijo notifica su selección. */
  select(value: unknown): void {
    if (this.isDisabled()) return;
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
    this.changed.emit(value);
  }

  /** Un radio hijo propaga el blur. */
  touch(): void {
    this.onTouched();
  }

  // --- ControlValueAccessor --------------------------------------------------
  writeValue(value: unknown): void {
    this.value.set(value);
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
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
