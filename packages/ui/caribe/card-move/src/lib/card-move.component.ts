import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  inject,
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
let nextId = 0;

@Component({
  selector: 'cb-card-move',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section class="cb-card-move">
      <ul class="cb-card-move__list">
        @for (item of items(); track $index) {
          <li class="cb-card-move__item">
            <span class="cb-card-move__label" [id]="uid + '-' + $index">{{ item }}</span>
            <span class="cb-card-move__controls">
              <button
                type="button"
                class="cb-card-move__btn"
                [attr.aria-label]="t().moveUp"
                [attr.aria-describedby]="uid + '-' + $index"
                [disabled]="$first"
                (click)="move($index, -1)"
              >
                ↑
              </button>
              <button
                type="button"
                class="cb-card-move__btn"
                [attr.aria-label]="t().moveDown"
                [attr.aria-describedby]="uid + '-' + $index"
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

  /** Prefijo de ids: cada botón se describe con la etiqueta de su elemento. */
  protected readonly uid = `cb-card-move-${++nextId}`;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected move(index: number, delta: number): void {
    const next = [...this.items()];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    this.items.set(next);
    this.followItem(target, delta);
  }

  /** El foco sigue al elemento movido; si su botón queda deshabilitado (extremo), pasa al otro. */
  private followItem(row: number, delta: number): void {
    afterNextRender(
      () => {
        const items = this.host.nativeElement.querySelectorAll('.cb-card-move__item');
        const buttons = Array.from(items[row]?.querySelectorAll<HTMLButtonElement>('.cb-card-move__btn') ?? []);
        const same = buttons[delta < 0 ? 0 : 1];
        (same && !same.disabled ? same : buttons.find((b) => !b.disabled))?.focus();
      },
      { injector: this.injector },
    );
  }
}
