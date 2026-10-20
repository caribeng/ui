import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Card-select de Caribe Design: tarjeta con buscador y lista de opciones
 * seleccionables.
 *
 * @example
 * ```html
 * <cb-card-select [items]="paises" [(selected)]="pais" />
 * ```
 */
@Component({
  selector: 'cb-card-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section class="cb-card-select">
      <input
        class="cb-card-select__search"
        type="search"
        [value]="query()"
        (input)="query.set($any($event.target).value)"
        [attr.aria-label]="t().filterOptions"
        [placeholder]="t().search"
      />
      <div class="cb-card-select__list" role="listbox" [attr.aria-label]="(label() ?? t().options)">
        @for (item of filtered(); track item) {
          <button
            type="button"
            class="cb-card-select__option"
            role="option"
            [class.cb-is-selected]="selected() === item"
            [attr.aria-selected]="selected() === item"
            (click)="selected.set(item); selectionChange.emit(item)"
          >
            {{ item }}
          </button>
        } @empty {
          <span class="cb-card-select__empty">{{ t().noResults }}</span>
        }
      </div>
    </section>
  `,
  styleUrl: './card-select.component.css',
})
export class CbCardSelect {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly items = input<readonly string[]>([]);
  readonly label = input<string | undefined>(undefined);
  readonly selected = model<string | null>(null);
  readonly selectionChange = output<string>();
  protected readonly query = model('');
  protected readonly filtered = computed(() =>
    this.items().filter((x) =>
      x.toLocaleLowerCase().includes(this.query().toLocaleLowerCase()),
    ),
  );
}
