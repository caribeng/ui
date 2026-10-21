import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
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
      <div
        class="cb-card-select__list"
        role="listbox"
        [attr.aria-label]="(label() ?? t().options)"
        (keydown)="onListKeydown($event)"
      >
        @for (item of filtered(); track $index) {
          <button
            type="button"
            class="cb-card-select__option"
            role="option"
            [class.cb-is-selected]="selected() === item"
            [attr.aria-selected]="selected() === item"
            [attr.tabindex]="$index === tabbable() ? 0 : -1"
            (click)="choose(item)"
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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Opción que entra en el orden de tabulación: la elegida o, si no está visible, la primera. */
  protected readonly tabbable = computed(() => Math.max(0, this.filtered().indexOf(this.selected() ?? '')));

  protected choose(item: string): void {
    this.selected.set(item);
    this.selectionChange.emit(item);
  }

  /** Patrón *listbox*: flechas (circular), Inicio y Fin mueven el foco; Enter / Espacio eligen (botón nativo). */
  protected onListKeydown(event: KeyboardEvent): void {
    const options = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.cb-card-select__option'));
    const cur = options.indexOf(event.target as HTMLElement);
    if (cur < 0) return;
    const last = options.length - 1;
    const target =
      event.key === 'ArrowDown' ? (cur < last ? cur + 1 : 0)
      : event.key === 'ArrowUp' ? (cur > 0 ? cur - 1 : last)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : -1;
    if (target < 0) return;
    event.preventDefault();
    for (const [i, option] of options.entries()) option.tabIndex = i === target ? 0 : -1;
    options[target].focus();
  }

  protected readonly filtered = computed(() =>
    this.items().filter((x) =>
      x.toLocaleLowerCase().includes(this.query().toLocaleLowerCase()),
    ),
  );
}
