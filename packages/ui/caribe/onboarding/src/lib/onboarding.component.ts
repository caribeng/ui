import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
  output,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';

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
      <section
        class="cb-onboarding"
        role="dialog"
        [attr.aria-label]="t().onboarding"
        (keydown.escape)="visible.set(false)"
      >
        <div class="cb-onboarding__dots" aria-hidden="true">
          @for (step of steps(); track $index) {
            <span
              class="cb-onboarding__dot"
              [class.cb-is-active]="$index === index()"
            ></span>
          }
        </div>
        <!-- Región viva: al cambiar de paso se anuncian el contador y el título. -->
        <div class="cb-onboarding__announce" aria-live="polite" aria-atomic="true">
          <span class="cb-onboarding__counter" aria-hidden="true">
            {{ index() + 1 }} / {{ steps().length }}
          </span>
          <span class="cb-onboarding__sr">{{ fmt(t().stepOf, index() + 1, steps().length) }}</span>
          <h2 class="cb-onboarding__title">{{ steps()[index()] }}</h2>
        </div>
        <div class="cb-onboarding__body"><ng-content /></div>
        <div class="cb-onboarding__actions">
          <button
            type="button"
            class="cb-onboarding__btn cb-onboarding__btn--ghost"
            (click)="visible.set(false)"
          >
            {{ t().skip }}
          </button>
          <button
            type="button"
            class="cb-onboarding__btn"
            (click)="previous()"
            [disabled]="index() === 0"
          >
            {{ t().previous }}
          </button>
          <button
            type="button"
            class="cb-onboarding__btn cb-onboarding__btn--primary"
            (click)="next()"
          >
            {{ index() === steps().length - 1 ? t().start : t().continue }}
          </button>
        </div>
      </section>
    }
  `,
  styleUrl: './onboarding.component.css',
})
export class CbOnboarding {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  readonly steps = input<readonly string[]>([]);
  readonly visible = model(true);
  readonly index = model(0);
  readonly currentStepIndex = output<number>();

  protected previous(): void {
    if (this.index() === 0) return;
    this.index.update((i) => i - 1);
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
