import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  contentChild,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
import { CbIcon } from '@caribeng/ui/icon';

/** Contexto de `<ng-template cbPickListItem let-item let-list="list">`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- como PrimeNG: la plantilla recibe el elemento sin tipar.
export interface CbPickListItemContext<T = any> {
  $implicit: T;
  index: number;
  list: 'source' | 'target';
}

/** Plantilla de cada elemento de un `<cb-picklist>`. */
@Directive({ selector: 'ng-template[cbPickListItem]' })
export class CbPickListItemTemplate {
  readonly template = inject<TemplateRef<CbPickListItemContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbPickListItemTemplate, ctx: unknown): ctx is CbPickListItemContext {
    return true;
  }
}

/** Elementos transferidos entre listas. */
export interface CbPickListMoveEvent {
  to: 'source' | 'target';
  items: readonly unknown[];
}

type Side = 'source' | 'target';

let nextUid = 0;

/**
 * PickList de CaribeNG: transfiere elementos entre una lista de disponibles y
 * otra de seleccionados, con botones, doble clic o teclado (Espacio marca,
 * Enter transfiere).
 *
 * @example
 * ```html
 * <cb-picklist [(source)]="disponibles" [(target)]="asignados" sourceHeader="Permisos" targetHeader="Asignados">
 *   <ng-template cbPickListItem let-permiso>{{ permiso.nombre }}</ng-template>
 * </cb-picklist>
 * ```
 */
@Component({
  selector: 'cb-picklist',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet, CbIcon],
  host: { class: 'cb-picklist-host' },
  template: `
    <div class="cb-picklist">
      <ng-container *ngTemplateOutlet="listTpl; context: { side: 'source', items: source(), header: sourceHeader() ?? t().available }" />

      <div class="cb-picklist__controls">
        <button type="button" class="cb-picklist__btn" [attr.aria-label]="t().moveToTarget" [disabled]="!selected().source.size" (click)="move('target')">
          <cb-icon name="chevron-right" [size]="16" aria-hidden="true" />
        </button>
        <button type="button" class="cb-picklist__btn" [attr.aria-label]="t().moveAllToTarget" [disabled]="!source().length" (click)="moveAll('target')">
          <cb-icon name="chevrons-right" [size]="16" aria-hidden="true" />
        </button>
        <button type="button" class="cb-picklist__btn" [attr.aria-label]="t().moveToSource" [disabled]="!selected().target.size" (click)="move('source')">
          <cb-icon name="chevron-left" [size]="16" aria-hidden="true" />
        </button>
        <button type="button" class="cb-picklist__btn" [attr.aria-label]="t().moveAllToSource" [disabled]="!target().length" (click)="moveAll('source')">
          <cb-icon name="chevrons-left" [size]="16" aria-hidden="true" />
        </button>
      </div>

      <ng-container *ngTemplateOutlet="listTpl; context: { side: 'target', items: target(), header: targetHeader() ?? t().selected }" />
    </div>

    <ng-template #listTpl let-side="side" let-items="items" let-header="header">
      <section class="cb-picklist__panel">
        <div class="cb-picklist__header" [id]="headerId(side)">{{ header }}</div>
        <ul
          class="cb-picklist__list"
          role="listbox"
          aria-multiselectable="true"
          [attr.aria-labelledby]="headerId(side)"
          [attr.data-side]="side"
          (keydown)="onKeydown($event, side)"
        >
          @for (item of items; track $index; let i = $index) {
            <li
              class="cb-picklist__item"
              role="option"
              [attr.aria-selected]="isSelected(side, i)"
              [attr.tabindex]="i === tabbable(side) ? 0 : -1"
              (focus)="setFocused(side, i)"
              (click)="toggle(side, i)"
              (dblclick)="moveOne(side, i)"
            >
              @if (itemTemplate(); as tpl) {
                <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: item, index: i, list: side }" />
              } @else {
                {{ item }}
              }
            </li>
          }
        </ul>
      </section>
    </ng-template>
  `,
  styleUrl: './picklist.component.css',
})
export class CbPickList {
  protected readonly t = injectCbTranslation();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly uid = `cb-picklist-${++nextUid}`;

  /** Elementos disponibles (two-way). */
  readonly source = model<readonly unknown[]>([]);
  /** Elementos seleccionados (two-way). */
  readonly target = model<readonly unknown[]>([]);
  /** Título de la lista de origen. Por defecto, "Disponibles" del idioma activo. */
  readonly sourceHeader = input<string | undefined>(undefined);
  /** Título de la lista de destino. Por defecto, "Seleccionados" del idioma activo. */
  readonly targetHeader = input<string | undefined>(undefined);

  /** Se emite tras transferir elementos. */
  readonly moved = output<CbPickListMoveEvent>();

  protected readonly itemTemplate = contentChild(CbPickListItemTemplate);
  /** Posiciones marcadas en cada lista. */
  protected readonly selected = signal<Record<Side, ReadonlySet<number>>>({ source: new Set(), target: new Set() });
  private readonly focused = signal<Record<Side, number>>({ source: 0, target: 0 });

  protected headerId(side: Side): string {
    return `${this.uid}-${side}`;
  }

  protected isSelected(side: Side, index: number): boolean {
    return this.selected()[side].has(index);
  }

  protected tabbable(side: Side): number {
    const max = this.list(side).length - 1;
    return Math.max(0, Math.min(this.focused()[side], max));
  }

  protected setFocused(side: Side, index: number): void {
    this.focused.update((f) => ({ ...f, [side]: index }));
  }

  protected toggle(side: Side, index: number): void {
    const next = new Set(this.selected()[side]);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    this.selected.update((s) => ({ ...s, [side]: next }));
    this.setFocused(side, index);
  }

  /** Transfiere los elementos marcados al lado indicado. */
  protected move(to: Side): void {
    const from: Side = to === 'target' ? 'source' : 'target';
    this.transfer(from, [...this.selected()[from]].sort((a, b) => a - b));
  }

  /** Transfiere todos los elementos al lado indicado. */
  protected moveAll(to: Side): void {
    const from: Side = to === 'target' ? 'source' : 'target';
    this.transfer(from, this.list(from).map((_, i) => i));
  }

  /** Transfiere un único elemento al otro lado (doble clic). */
  protected moveOne(from: Side, index: number): void {
    this.transfer(from, [index]);
  }

  protected onKeydown(event: KeyboardEvent, side: Side): void {
    const count = this.list(side).length;
    if (!count) return;
    const current = this.tabbable(side);
    let target = -1;
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
      case ' ':
        this.toggle(side, current);
        break;
      case 'Enter':
        // Transfiere los marcados; si no hay ninguno, el enfocado.
        if (this.selected()[side].size) this.move(side === 'source' ? 'target' : 'source');
        else this.moveOne(side, current);
        break;
      default:
        return;
    }
    event.preventDefault();
    if (target >= 0) {
      this.setFocused(side, target);
      this.host.nativeElement
        .querySelectorAll<HTMLElement>(`[data-side="${side}"] [role="option"]`)
        [target]?.focus();
    }
  }

  private list(side: Side): readonly unknown[] {
    return side === 'source' ? this.source() : this.target();
  }

  private transfer(from: Side, indices: readonly number[]): void {
    if (!indices.length) return;
    const to: Side = from === 'source' ? 'target' : 'source';
    const picked = new Set(indices);
    const items = this.list(from).filter((_, i) => picked.has(i));
    const remaining = this.list(from).filter((_, i) => !picked.has(i));
    const destination = [...this.list(to), ...items];
    (from === 'source' ? this.source : this.target).set(remaining);
    (to === 'source' ? this.source : this.target).set(destination);
    this.selected.set({ source: new Set(), target: new Set() });
    this.moved.emit({ to, items });
  }
}
