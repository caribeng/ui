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
 * Coachmark de Caribe Design: tarjeta de ayuda guiada paso a paso para resaltar
 * funcionalidades.
 *
 * @example
 * ```html
 * <cb-coachmark [steps]="['Bienvenido', 'Crea tu cuenta']" />
 * ```
 */
@Component({
  selector: 'cb-coachmark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    @if (visible() && steps().length) {
      <aside class="cb-coachmark" role="dialog" [attr.aria-label]="t().guidedHelp">
        <span class="cb-coachmark__counter">
          {{ fmt(t().stepOf, index() + 1, steps().length) }}
        </span>
        <h3 class="cb-coachmark__title">{{ steps()[index()] }}</h3>
        <div class="cb-coachmark__actions">
          <button
            type="button"
            class="cb-coachmark__btn cb-coachmark__btn--ghost"
            (click)="close()"
          >
            {{ t().skip }}
          </button>
          <button
            type="button"
            class="cb-coachmark__btn"
            (click)="previous()"
            [disabled]="index() === 0"
          >
            {{ t().previous }}
          </button>
          <button
            type="button"
            class="cb-coachmark__btn cb-coachmark__btn--primary"
            (click)="next()"
          >
            {{ index() === steps().length - 1 ? t().finish : t().next }}
          </button>
        </div>
      </aside>
    }
  `,
  styleUrl: './coachmark.component.css',
})
export class CbCoachmark {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  /** Rellena `{0}`, `{1}`… de un texto traducido. */
  protected readonly fmt = cbFormat;
  readonly steps = input<readonly string[]>([]);
  readonly visible = model(true);
  readonly index = model(0);
  readonly stepChange = output<number>();

  protected previous(): void {
    this.index.update((i) => Math.max(0, i - 1));
    this.stepChange.emit(this.index());
  }
  protected next(): void {
    if (this.index() >= this.steps().length - 1) {
      this.close();
      return;
    }
    this.index.update((i) => i + 1);
    this.stepChange.emit(this.index());
  }
  protected close(): void {
    this.visible.set(false);
  }
}
