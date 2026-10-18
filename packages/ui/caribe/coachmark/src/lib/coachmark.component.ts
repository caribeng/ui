import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
  output,
} from '@angular/core';

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
      <aside class="cb-coachmark" role="dialog" aria-label="Ayuda guiada">
        <span class="cb-coachmark__counter">
          Paso {{ index() + 1 }} de {{ steps().length }}
        </span>
        <h3 class="cb-coachmark__title">{{ steps()[index()] }}</h3>
        <div class="cb-coachmark__actions">
          <button
            type="button"
            class="cb-coachmark__btn cb-coachmark__btn--ghost"
            (click)="close()"
          >
            Omitir
          </button>
          <button
            type="button"
            class="cb-coachmark__btn"
            (click)="previous()"
            [disabled]="index() === 0"
          >
            Anterior
          </button>
          <button
            type="button"
            class="cb-coachmark__btn cb-coachmark__btn--primary"
            (click)="next()"
          >
            {{ index() === steps().length - 1 ? 'Finalizar' : 'Siguiente' }}
          </button>
        </div>
      </aside>
    }
  `,
  styleUrl: './coachmark.component.css',
})
export class CbCoachmark {
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
