import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { CdkDrag, CdkDragPlaceholder, CdkDropList, CdkDropListGroup, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

/** Columna del tablero. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- como Table: los items llegan sin tipar.
export interface CbKanbanColumn<T = any> {
  readonly id: string;
  readonly title: string;
  readonly items: readonly T[];
  /** Límite de tarjetas (WIP). Se avisa al superarlo; con `enforceLimit` no deja pasarlo. */
  readonly limit?: number;
  /** Color de la columna (borde superior). */
  readonly color?: string;
}

/** Tarjeta movida (con ratón, dedo o teclado). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- como Table: los items llegan sin tipar.
export interface CbKanbanMove<T = any> {
  readonly item: T;
  readonly from: string;
  readonly to: string;
  readonly fromIndex: number;
  readonly toIndex: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- la plantilla recibe la tarjeta sin tipar.
export interface CbKanbanCardContext<T = any> {
  $implicit: T;
  column: CbKanbanColumn<T>;
  index: number;
}

/** Plantilla de las tarjetas: `<ng-template cbKanbanCard let-item let-column="column">`. */
@Directive({ selector: 'ng-template[cbKanbanCard]' })
export class CbKanbanCardDirective {
  readonly template = inject<TemplateRef<CbKanbanCardContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbKanbanCardDirective, ctx: unknown): ctx is CbKanbanCardContext {
    return true;
  }
}

interface Grab {
  readonly key: unknown;
  readonly snapshot: readonly CbKanbanColumn[];
  readonly fromColumn: number;
  readonly fromIndex: number;
}

let nextUid = 0;

/**
 * Tablero Kanban de CaribeNG: columnas con tarjetas que se reordenan y se
 * mueven entre columnas arrastrando (ratón o dedo, con `@angular/cdk/drag-drop`)
 * o con el teclado: Espacio toma la tarjeta, las flechas la mueven, Espacio la
 * suelta y Escape cancela, con cada paso anunciado al lector de pantalla.
 * Admite límite de tarjetas por columna (WIP) y una plantilla de tarjeta propia.
 *
 * @example
 * ```html
 * <cb-kanban [(columns)]="columnas" (cardMove)="guardar($event)">
 *   <ng-template cbKanbanCard let-tarea>{{ tarea.title }}</ng-template>
 * </cb-kanban>
 * ```
 */
@Component({
  selector: 'cb-kanban',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet, CdkDropListGroup, CdkDropList, CdkDrag, CdkDragPlaceholder, CbIcon],
  host: { class: 'cb-kanban' },
  template: `
    <div class="cb-kanban__board" cdkDropListGroup [attr.aria-label]="ariaLabel() || null" [attr.role]="ariaLabel() ? 'group' : null">
      @for (col of columns(); track col.id; let c = $index) {
        <section class="cb-kanban__column" [style.--cb-kanban-color]="col.color || null" [attr.aria-labelledby]="uid + '-h' + c">
          <header class="cb-kanban__header">
            <h3 class="cb-kanban__title" [id]="uid + '-h' + c">{{ col.title }}</h3>
            <span class="cb-kanban__count" [class.cb-kanban__count--over]="isOver(col)">
              {{ col.limit ? fmt(t().kanbanCount, col.items.length, col.limit) : col.items.length }}
            </span>
          </header>
          <div
            class="cb-kanban__list"
            role="list"
            cdkDropList
            [id]="uid + '-l' + c"
            [cdkDropListData]="col"
            [cdkDropListEnterPredicate]="canEnter"
            (cdkDropListDropped)="onDrop($event)"
          >
            @for (item of col.items; track key(item); let i = $index) {
              <div class="cb-kanban__item" role="listitem" cdkDrag [cdkDragData]="item" [cdkDragDisabled]="disabled()">
                <div
                  class="cb-kanban__card"
                  tabindex="0"
                  role="button"
                  [attr.data-key]="keyAttr(item)"
                  [class.cb-kanban__card--grabbed]="isGrabbed(item)"
                  [attr.aria-roledescription]="t().kanbanCard"
                  [attr.aria-describedby]="uid + '-help'"
                  [attr.aria-pressed]="isGrabbed(item)"
                  (keydown)="onCardKeydown($event, c, i)"
                  (click)="cardOpen.emit(item)"
                >
                  <ng-container *ngTemplateOutlet="cardTpl()?.template ?? defaultCard; context: { $implicit: item, column: col, index: i }" />
                </div>
                <div *cdkDragPlaceholder class="cb-kanban__placeholder"></div>
              </div>
            } @empty {
              <div class="cb-kanban__empty">{{ emptyMessage() ?? t().noData }}</div>
            }
          </div>
          @if (addable()) {
            <button type="button" class="cb-kanban__add" [disabled]="disabled() || (enforceLimit() && isFull(col))" (click)="addCard.emit(col.id)">
              <cb-icon name="plus" [size]="16" aria-hidden="true" />
              {{ t().kanbanAdd }}
            </button>
          }
        </section>
      }
    </div>
    <p class="cb-kanban__sr" [id]="uid + '-help'">{{ t().kanbanInstructions }}</p>
    <div class="cb-kanban__sr" role="status">{{ announcement() }}</div>

    <ng-template #defaultCard let-item>
      <span class="cb-kanban__card-title">{{ label(item) }}</span>
      @if (item?.description) {
        <span class="cb-kanban__card-description">{{ item.description }}</span>
      }
    </ng-template>
  `,
  styleUrl: './kanban.component.css',
})
export class CbKanban {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  protected readonly fmt = cbFormat;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  protected readonly uid = `cb-kanban-${++nextUid}`;
  protected readonly cardTpl = contentChild(CbKanbanCardDirective);

  /** Columnas con sus tarjetas (bidireccional: se actualiza al mover). */
  readonly columns = model<readonly CbKanbanColumn[]>([]);
  /** Propiedad que identifica cada tarjeta. */
  readonly itemKey = input<string>('id');
  /** Propiedad con el nombre de la tarjeta (tarjeta por defecto y anuncios). */
  readonly itemLabel = input<string>('title');
  /** No deja superar el `limit` de una columna. */
  readonly enforceLimit = input(false, { transform: booleanAttribute });
  /** Botón "Añadir tarjeta" al pie de cada columna (emite `addCard`). */
  readonly addable = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Texto de una columna vacía. Por defecto, "Sin datos". */
  readonly emptyMessage = input<string | undefined>(undefined);
  /** Nombre del tablero. */
  readonly ariaLabel = input<string>('');

  /** Tarjeta movida (al soltarla). */
  readonly cardMove = output<CbKanbanMove>();
  /** Se pulsó (o Enter sobre) una tarjeta. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- la tarjeta llega sin tipar.
  readonly cardOpen = output<any>();
  /** Se pulsó "Añadir tarjeta" en una columna (su id). */
  readonly addCard = output<string>();

  protected readonly announcement = signal('');
  private readonly grab = signal<Grab | null>(null);

  // --- Datos ---------------------------------------------------------------
  protected key(item: unknown): unknown {
    const field = this.itemKey();
    return item && typeof item === 'object' && field in item ? (item as Record<string, unknown>)[field] : item;
  }

  protected keyAttr(item: unknown): string {
    return String(this.key(item));
  }

  protected label(item: unknown): string {
    const field = this.itemLabel();
    if (item && typeof item === 'object' && field in item) return String((item as Record<string, unknown>)[field]);
    return String(item);
  }

  protected isFull(col: CbKanbanColumn): boolean {
    return col.limit !== undefined && col.items.length >= col.limit;
  }

  protected isOver(col: CbKanbanColumn): boolean {
    return col.limit !== undefined && col.items.length > col.limit;
  }

  protected isGrabbed(item: unknown): boolean {
    const grab = this.grab();
    return !!grab && grab.key === this.key(item);
  }

  /** Mueve una tarjeta (de forma inmutable) y devuelve las columnas nuevas. */
  private moved(columns: readonly CbKanbanColumn[], from: number, fromIndex: number, to: number, toIndex: number): CbKanbanColumn[] {
    const next = columns.map((c) => ({ ...c, items: [...c.items] }));
    const [item] = next[from].items.splice(fromIndex, 1);
    next[to].items.splice(Math.max(0, Math.min(toIndex, next[to].items.length)), 0, item);
    return next;
  }

  // --- Arrastrar (CDK) ------------------------------------------------------
  protected readonly canEnter = (drag: CdkDrag, drop: CdkDropList<CbKanbanColumn>): boolean =>
    !this.enforceLimit() || drag.dropContainer === drop || !this.isFull(drop.data);

  protected onDrop(event: CdkDragDrop<CbKanbanColumn>): void {
    const columns = this.columns();
    const from = columns.indexOf(event.previousContainer.data);
    const to = columns.indexOf(event.container.data);
    if (from < 0 || to < 0 || (from === to && event.previousIndex === event.currentIndex)) return;
    const item = columns[from].items[event.previousIndex];
    this.columns.set(this.moved(columns, from, event.previousIndex, to, event.currentIndex));
    const toIndex = Math.min(event.currentIndex, this.columns()[to].items.length - 1);
    this.cardMove.emit({ item, from: columns[from].id, to: columns[to].id, fromIndex: event.previousIndex, toIndex });
    this.announcement.set(cbFormat(this.t().kanbanDropped, this.label(item), columns[to].title, String(toIndex + 1)));
  }

  // --- Teclado ----------------------------------------------------------------
  protected onCardKeydown(event: KeyboardEvent, column: number, index: number): void {
    if (this.disabled()) return;
    const columns = this.columns();
    const item = columns[column].items[index];
    const grab = this.grab();

    if (!grab) {
      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        this.grab.set({ key: this.key(item), snapshot: columns, fromColumn: column, fromIndex: index });
        this.announce('kanbanGrabbed', item, column, index);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        this.cardOpen.emit(item);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();
        const toIndex = index + (event.key === 'ArrowDown' ? 1 : -1);
        if (toIndex < 0 || toIndex >= columns[column].items.length) return;
        this.applyKeyboardMove(column, index, column, toIndex, item);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowRight': {
        event.preventDefault();
        const step = event.key === 'ArrowRight' ? 1 : -1;
        let target = column + step;
        // Salta las columnas llenas cuando el límite es obligatorio.
        while (this.enforceLimit() && target >= 0 && target < columns.length && this.isFull(columns[target])) {
          this.announcement.set(cbFormat(this.t().kanbanFull, columns[target].title));
          target += step;
        }
        if (target < 0 || target >= columns.length) return;
        this.applyKeyboardMove(column, index, target, Math.min(index, columns[target].items.length), item);
        break;
      }
      case ' ':
      case 'Spacebar':
      case 'Enter': {
        event.preventDefault();
        this.grab.set(null);
        const from = grab.snapshot[grab.fromColumn];
        if (from.id !== columns[column].id || grab.fromIndex !== index) {
          this.cardMove.emit({ item, from: from.id, to: columns[column].id, fromIndex: grab.fromIndex, toIndex: index });
        }
        this.announcement.set(cbFormat(this.t().kanbanDropped, this.label(item), columns[column].title, String(index + 1)));
        break;
      }
      case 'Escape': {
        event.preventDefault();
        this.grab.set(null);
        this.columns.set(grab.snapshot);
        this.announcement.set(cbFormat(this.t().kanbanCancelled, this.label(item), grab.snapshot[grab.fromColumn].title));
        this.focusCard(this.key(item));
        break;
      }
      case 'Tab':
        // Salir con Tab suelta la tarjeta donde está.
        this.grab.set(null);
        break;
    }
  }

  private applyKeyboardMove(from: number, fromIndex: number, to: number, toIndex: number, item: unknown): void {
    this.columns.set(this.moved(this.columns(), from, fromIndex, to, toIndex));
    this.announce('kanbanMoved', item, to, toIndex);
    this.focusCard(this.key(item));
  }

  private announce(key: 'kanbanGrabbed' | 'kanbanMoved', item: unknown, column: number, index: number): void {
    const col = this.columns()[column];
    this.announcement.set(cbFormat(this.t()[key], this.label(item), col.title, String(index + 1), String(col.items.length)));
  }

  /** La tarjeta se vuelve a pintar al moverla: se recupera el foco tras el render. */
  private focusCard(key: unknown): void {
    afterNextRender(
      () => {
        const cards = this.host.nativeElement.querySelectorAll<HTMLElement>('.cb-kanban__card');
        Array.from(cards).find((c) => c.dataset['key'] === String(key))?.focus();
      },
      { injector: this.injector },
    );
  }
}
