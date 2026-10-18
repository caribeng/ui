import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/**
 * Tracker de Caribe Design: indicador de progreso por pasos (stepper) con
 * marcadores completados, activo y pendientes conectados por líneas.
 *
 * @example
 * ```html
 * <cb-tracker [steps]="['Origen', 'Monto', 'Confirmar']" [currentIndex]="1" />
 * ```
 */
@Component({
  selector: 'cb-tracker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <ol class="cb-tracker" aria-label="Progreso">
      @for (step of steps(); track $index) {
        <li
          class="cb-tracker__step"
          [class.cb-is-complete]="$index < currentIndex()"
          [class.cb-is-current]="$index === currentIndex()"
          [attr.aria-current]="ariaCurrent($index)"
        >
          <span class="cb-tracker__marker">{{ marker($index) }}</span>
          <span class="cb-tracker__label">{{ step }}</span>
        </li>
      }
    </ol>
  `,
  styleUrl: './tracker.component.css',
})
export class CbTracker {
  readonly steps = input<readonly string[]>([]);
  readonly currentIndex = input(0);

  protected ariaCurrent(index: number): 'step' | null {
    return index === this.currentIndex() ? 'step' : null;
  }
  protected marker(index: number): string | number {
    return index < this.currentIndex() ? '✓' : index + 1;
  }
}
