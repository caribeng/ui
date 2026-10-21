import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

/** Contexto de `<ng-template cbOrderListItem let-item let-index="index">`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- como PrimeNG: la plantilla recibe el elemento sin tipar.
export interface CbOrderListItemContext<T = any> {
  $implicit: T;
  index: number;
}

/** Plantilla de cada elemento de un `<cb-orderlist>`. */
@Directive({ selector: 'ng-template[cbOrderListItem]' })
export class CbOrderListItemTemplate {
  readonly template = inject<TemplateRef<CbOrderListItemContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbOrderListItemTemplate, ctx: unknown): ctx is CbOrderListItemContext {
    return true;
  }
}

/** Evento de reordenación. */
export interface CbOrderListReorderEvent {
  from: number;
  to: number;
  value: readonly unknown[];
}

let nextUid = 0;

/**
 * Lista reordenable de CaribeNG. Selecciona un elemento y muévelo con los
 * botones o con Alt + ↑/↓.
 *
 * @example
 * ```html
 * <cb-orderlist [(value)]="pasos" header="Orden de aprobación">
 *   <ng-template cbOrderListItem let-paso>{{ paso.nombre }}</ng-template>
 * </cb-orderlist>
 * ```
 */
@Component({
  selector: 'cb-orderlist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet, CbIcon],
  host: { class: 'cb-orderlist-host' },
  template: `
    <div class="cb-orderlist">
      <div class="cb-orderlist__controls" role="group" [attr.aria-label]="listLabel()">
        <button type="button" class="cb-orderlist__btn" [attr.aria-label]="t().moveTop" [disabled]="!canMoveUp()" (click)="moveTo(0)">
          <cb-icon name="chevrons-up" [size]="16" aria-hidden="true" />
        </button>
        <button type="button" class="cb-orderlist__btn" [attr.aria-label]="t().moveUp" [disabled]="!canMoveUp()" (click)="moveBy(-1)">
          <cb-icon name="chevron-up" [size]="16" aria-hidden="true" />
        </button>
        <button type="button" class="cb-orderlist__btn" [attr.aria-label]="t().moveDown" [disabled]="!canMoveDown()" (click)="moveBy(1)">
          <cb-icon name="chevron-down" [size]="16" aria-hidden="true" />
        </button>
        <button type="button" class="cb-orderlist__btn" [attr.aria-label]="t().moveBottom" [disabled]="!canMoveDown()" (click)="moveTo(value().length - 1)">
          <cb-icon name="chevrons-down" [size]="16" aria-hidden="true" />
        </button>
      </div>

      <div class="cb-orderlist__panel">
        @if (header()) {
          <div class="cb-orderlist__header" [id]="headerId">{{ header() }}</div>
        }
        <ul
          class="cb-orderlist__list"
          role="listbox"
          [attr.aria-labelledby]="header() ? headerId : null"
          [attr.aria-label]="header() ? null : listLabel()"
          (keydown)="onKeydown($event)"
        >
          @for (item of value(); track $index; let i = $index) {
            <li
              class="cb-orderlist__item"
              role="option"
              [attr.aria-selected]="selectedIndex() === i"
              [attr.tabindex]="i === tabbableIndex() ? 0 : -1"
              (focus)="focusedIndex.set(i)"
              (click)="select(i)"
            >
              @if (itemTemplate(); as tpl) {
                <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: item, index: i }" />
              } @else {
                {{ item }}
              }
            </li>
          }
        </ul>
      </div>
    </div>
  `,
  styleUrl: './orderlist.component.css',
})
export class CbOrderList {
  protected readonly t = injectCbTranslation();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  protected readonly headerId = `cb-orderlist-${++nextUid}-header`;

  /** Elementos, en orden (two-way). */
  readonly value = model<readonly unknown[]>([]);
  /** Título visible de la lista (también la nombra para el lector de pantalla). */
  readonly header = input<string>('');
  /** Nombre accesible cuando no hay `header`. Por defecto, el del idioma activo. */
  readonly ariaLabel = input<string | undefined>(undefined);

  /** Se emite tras mover un elemento. */
  readonly reorder = output<CbOrderListReorderEvent>();

  protected readonly itemTemplate = contentChild(CbOrderListItemTemplate);
  /** Índice seleccionado (se guarda por posición: admite elementos repetidos). */
  protected readonly selectedIndex = signal(-1);
  protected readonly focusedIndex = signal(-1);
  protected readonly tabbableIndex = computed(() => {
    const focused = this.focusedIndex();
    if (focused >= 0 && focused < this.value().length) return focused;
    return this.selectedIndex() >= 0 ? this.selectedIndex() : 0;
  });

  protected readonly listLabel = computed(() => this.ariaLabel() ?? this.t().sortableList);
  protected readonly canMoveUp = computed(() => this.selectedIndex() > 0);
  protected readonly canMoveDown = computed(() => {
    const i = this.selectedIndex();
    return i >= 0 && i < this.value().length - 1;
  });

  protected select(index: number): void {
    this.selectedIndex.set(index);
    this.focusedIndex.set(index);
  }

  protected moveBy(delta: number): void {
    this.moveTo(this.selectedIndex() + delta);
  }

  protected moveTo(to: number): void {
    const from = this.selectedIndex();
    const items = this.value();
    if (from < 0 || to < 0 || to >= items.length || to === from) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    this.value.set(next);
    this.selectedIndex.set(to);
    this.focusedIndex.set(to);
    this.reorder.emit({ from, to, value: next });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.value().length;
    if (!count) return;
    const current = this.tabbableIndex();
    let target = -1;

    if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      // Alt + flechas mueve el elemento seleccionado (o el enfocado).
      if (this.selectedIndex() < 0) this.selectedIndex.set(current);
      this.moveBy(event.key === 'ArrowUp' ? -1 : 1);
      target = this.selectedIndex();
    } else {
      switch (event.key) {
        case 'ArrowDown':
          target = Math.min(count - 1, current + 1);
          break;
        case 'ArrowUp':
          target = Math.max(0, current - 1);
          break;
        case 'Home':
          target = 0;
          break;
        case 'End':
          target = count - 1;
          break;
        case 'Enter':
        case ' ':
          this.select(current);
          break;
        default:
          return;
      }
    }
    event.preventDefault();
    if (target >= 0) this.focusItem(target);
  }

  private focusItem(index: number): void {
    this.focusedIndex.set(index);
    // La lista puede haberse reordenado: se enfoca tras el siguiente render.
    afterNextRender(() => this.host.nativeElement.querySelectorAll<HTMLElement>('[role="option"]')[index]?.focus(), {
      injector: this.injector,
    });
  }
}
