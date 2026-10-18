import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
  output,
} from '@angular/core';

/**
 * Onboarding de Caribe Design: panel de bienvenida paso a paso con progreso y
 * navegación.
 *
 * @example
 * ```html
 * <cb-onboarding [steps]="['Bienvenido', 'Seguridad', 'Listo']" />
 * ```
 */
@Component({
  selector: 'cb-onboarding',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    @if (visible() && steps().length) {
      <section class="cb-onboarding" role="dialog" aria-label="Onboarding">
        <div class="cb-onboarding__dots" aria-hidden="true">
          @for (step of steps(); track $index) {
            <span
              class="cb-onboarding__dot"
              [class.cb-is-active]="$index === index()"
            ></span>
          }
        </div>
        <span class="cb-onboarding__counter">
          {{ index() + 1 }} / {{ steps().length }}
        </span>
        <h2 class="cb-onboarding__title">{{ steps()[index()] }}</h2>
        <div class="cb-onboarding__body"><ng-content /></div>
        <div class="cb-onboarding__actions">
          <button
            type="button"
            class="cb-onboarding__btn cb-onboarding__btn--ghost"
            (click)="visible.set(false)"
          >
            Omitir
          </button>
          <button
            type="button"
            class="cb-onboarding__btn"
            (click)="previous()"
            [disabled]="index() === 0"
          >
            Anterior
          </button>
          <button
            type="button"
            class="cb-onboarding__btn cb-onboarding__btn--primary"
            (click)="next()"
          >
            {{ index() === steps().length - 1 ? 'Comenzar' : 'Continuar' }}
          </button>
        </div>
      </section>
    }
  `,
  styleUrl: './onboarding.component.css',
})
export class CbOnboarding {
  readonly steps = input<readonly string[]>([]);
  readonly visible = model(true);
  readonly index = model(0);
  readonly currentStepIndex = output<number>();

  protected previous(): void {
    this.index.update((i) => Math.max(0, i - 1));
    this.currentStepIndex.emit(this.index());
  }
  protected next(): void {
    if (this.index() < this.steps().length - 1) {
      this.index.update((i) => i + 1);
      this.currentStepIndex.emit(this.index());
    } else {
      this.visible.set(false);
    }
  }
}
