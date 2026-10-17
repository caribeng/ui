import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from '@angular/core';
import { CbRadioGroupComponent } from './radio-group.component';

let nextUid = 0;

/**
 * Radio individual de CaribeNG. Debe vivir dentro de un `<cb-radio-group>`,
 * que actúa como `ControlValueAccessor` y coordina la selección.
 */
@Component({
  selector: 'cb-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-radio-host' },
  template: `
    <label
      class="cb-radio"
      [class]="'cb-radio--' + group.size()"
      [class.cb-is-disabled]="isDisabled()"
    >
      <input
        type="radio"
        class="cb-radio__input"
        [id]="inputId()"
        [name]="group.name()"
        [checked]="group.isSelected(value())"
        [disabled]="isDisabled()"
        [attr.aria-label]="label() ? null : ariaLabel()"
        (change)="group.select(value())"
        (blur)="group.touch()"
      />
      <span class="cb-radio__circle" aria-hidden="true"></span>
      @if (label()) {
        <span class="cb-radio__label">{{ label() }}</span>
      }
    </label>
  `,
  styleUrl: './radio.component.css',
})
export class CbRadioComponent {
  /** Grupo contenedor (obligatorio). */
  protected readonly group = inject(CbRadioGroupComponent);

  /** Valor que representa este radio. */
  readonly value = input.required<unknown>();
  /** Etiqueta mostrada junto al control. */
  readonly label = input<string>('');
  /** `aria-label` cuando no hay `label` visible. */
  readonly ariaLabel = input<string>('');
  /** Deshabilita solo este radio (además del grupo). */
  readonly disabled = input<boolean, unknown>(false, { transform: toBoolean });
  /** Id del input; se genera uno estable si no se provee. */
  readonly inputId = input<string>(`cb-radio-${++nextUid}`);

  protected readonly isDisabled = computed(
    () => this.disabled() || this.group.isDisabled(),
  );
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
