import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  model,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Card-move de Caribe Design: lista de elementos reordenables mediante botones
 * de subir/bajar.
 *
 * @example
 * ```html
 * <cb-card-move [(items)]="opciones" />
 * ```
 */
@Component({
  selector: 'cb-card-move',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section class="cb-card-move">
      <ul class="cb-card-move__list">
        @for (item of items(); track $index) {
          <li class="cb-card-move__item">
            <span class="cb-card-move__label">{{ item }}</span>
            <span class="cb-card-move__controls">
              <button
                type="button"
                class="cb-card-move__btn"
                [attr.aria-label]="t().moveUp"
                [disabled]="$first"
                (click)="move($index, -1)"
              >
                ↑
              </button>
              <button
                type="button"
                class="cb-card-move__btn"
                [attr.aria-label]="t().moveDown"
                [disabled]="$last"
                (click)="move($index, 1)"
              >
                ↓
              </button>
            </span>
          </li>
        }
      </ul>
    </section>
  `,
  styleUrl: './card-move.component.css',
})
export class CbCardMove {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly items = model<readonly string[]>([]);

  protected move(index: number, delta: number): void {
    const next = [...this.items()];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    this.items.set(next);
  }
}
