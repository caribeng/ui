import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

/** Contexto de `<ng-template cbVirtualItem let-item let-index="index">`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- como PrimeNG: la plantilla recibe el elemento sin tipar.
export interface CbVirtualItemContext<T = any> {
  $implicit: T;
  index: number;
}

/** Plantilla de cada elemento de un `<cb-virtualscroller>`. */
@Directive({ selector: 'ng-template[cbVirtualItem]' })
export class CbVirtualItemTemplate {
  readonly template = inject<TemplateRef<CbVirtualItemContext>>(TemplateRef);

  static ngTemplateContextGuard(_dir: CbVirtualItemTemplate, ctx: unknown): ctx is CbVirtualItemContext {
    return true;
  }
}

/**
 * Lista virtualizada de CaribeNG: solo pinta los elementos visibles (más un
 * margen) aunque la lista tenga miles. Cada elemento expone `aria-setsize` y
 * `aria-posinset`, así el lector de pantalla conoce el total.
 *
 * @example
 * ```html
 * <cb-virtualscroller [items]="clientes" [itemSize]="48" [viewportHeight]="320" ariaLabel="Clientes">
 *   <ng-template cbVirtualItem let-cliente let-i="index">{{ i + 1 }}. {{ cliente.nombre }}</ng-template>
 * </cb-virtualscroller>
 * ```
 */
@Component({
  selector: 'cb-virtualscroller',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [NgTemplateOutlet],
  host: { class: 'cb-virtualscroller-host' },
  template: `
    <div
      #viewport
      class="cb-virtualscroller"
      role="list"
      tabindex="0"
      [attr.aria-label]="ariaLabel() || null"
      [style.height.px]="viewportHeight()"
      (scroll)="onScroll($event)"
    >
      <div class="cb-virtualscroller__spacer" [style.height.px]="totalHeight()">
        <div class="cb-virtualscroller__window" [style.transform]="'translateY(' + offset() + 'px)'">
          @for (item of visibleItems(); track start() + $index; let i = $index) {
            <div
              class="cb-virtualscroller__item"
              role="listitem"
              [attr.aria-setsize]="items().length"
              [attr.aria-posinset]="start() + i + 1"
              [style.height.px]="itemSize()"
            >
              @if (itemTemplate(); as tpl) {
                <ng-container *ngTemplateOutlet="tpl.template; context: { $implicit: item, index: start() + i }" />
              } @else {
                {{ item }}
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './virtualscroller.component.css',
})
export class CbVirtualScroller {
  /** Elementos de la lista. */
  readonly items = input<readonly unknown[]>([]);
  /** Alto fijo de cada elemento, en píxeles. */
  readonly itemSize = input<number>(40);
  /** Alto visible de la lista, en píxeles. */
  readonly viewportHeight = input<number>(240);
  /** Elementos extra que se pintan por encima y por debajo de lo visible (evita parpadeos al hacer scroll). */
  readonly buffer = input<number>(4);
  /** Nombre accesible de la lista. */
  readonly ariaLabel = input<string>('');

  protected readonly itemTemplate = contentChild(CbVirtualItemTemplate);
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly scrollTop = signal(0);

  /** Índice del primer elemento pintado. */
  protected readonly start = computed(() =>
    Math.max(0, Math.floor(this.scrollTop() / this.itemSize()) - this.buffer()),
  );
  private readonly end = computed(() =>
    Math.min(
      this.items().length,
      Math.ceil((this.scrollTop() + this.viewportHeight()) / this.itemSize()) + this.buffer(),
    ),
  );
  protected readonly visibleItems = computed(() => this.items().slice(this.start(), this.end()));
  protected readonly offset = computed(() => this.start() * this.itemSize());
  protected readonly totalHeight = computed(() => this.items().length * this.itemSize());

  /** Desplaza la lista hasta el elemento indicado (lo deja arriba). */
  scrollToIndex(index: number): void {
    const top = Math.max(0, Math.min(index, this.items().length - 1)) * this.itemSize();
    this.viewport().nativeElement.scrollTop = top;
    this.scrollTop.set(top);
  }

  protected onScroll(event: Event): void {
    this.scrollTop.set((event.target as HTMLElement).scrollTop);
  }
}
