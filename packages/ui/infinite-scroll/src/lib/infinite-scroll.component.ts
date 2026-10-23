import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { cbFormat, injectCbTranslation } from '@caribeng/ui';
import { CbSpinner } from '@caribeng/ui/spinner';

/** `auto`: carga al llegar al final; `button`: solo con el botón "Cargar más". */
export type CbInfiniteScrollMode = 'auto' | 'button';

/** Quién pidió la carga. */
export type CbLoadMoreSource = 'scroll' | 'button' | 'retry';

/**
 * Scroll infinito de CaribeNG: envuelve una lista y pide más elementos (`loadMore`) al acercarse
 * al final, con un botón "Cargar más" como alternativa. Tras `autoLimit` cargas automáticas pasa
 * al botón, para que el pie de página siga siendo alcanzable; anuncia las cargas y, al cargar con
 * el botón, lleva el foco al primer elemento nuevo.
 *
 * @example
 * ```html
 * <cb-infinite-scroll [loading]="cargando()" [hasMore]="hayMas()" [count]="items().length" (loadMore)="cargar()">
 *   <ul>@for (i of items(); track i.id) { <li>{{ i.nombre }}</li> }</ul>
 * </cb-infinite-scroll>
 * ```
 */
@Component({
  selector: 'cb-infinite-scroll',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbSpinner],
  host: {
    class: 'cb-infinite-scroll',
    '[class.cb-infinite-scroll--self]': 'scrollable()',
    '[style.max-height]': 'scrollable() ? height() : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  template: `
    <ng-content />
    <div #sentinel class="cb-is__sentinel" aria-hidden="true"></div>
    <div class="cb-is__footer">
      @if (loading()) {
        <!-- Lo anuncia la región aria-live de abajo (el spinner es role="status" y lo repetiría). -->
        <span class="cb-is__status" aria-hidden="true">
          <cb-spinner [size]="20" />
          {{ t().infiniteLoading }}
        </span>
      } @else if (error()) {
        <span class="cb-is__error">{{ errorMessage() ?? t().infiniteError }}</span>
        <button type="button" class="cb-is__btn" (click)="request('retry')">{{ t().infiniteRetry }}</button>
      } @else if (hasMore()) {
        @if (showButton()) {
          <button #more type="button" class="cb-is__btn" (click)="request('button')">{{ loadMoreLabel() ?? t().infiniteLoadMore }}</button>
        }
      } @else if (showEnd()) {
        <span class="cb-is__end">{{ endMessage() ?? t().infiniteEnd }}</span>
      }
    </div>
    <span class="cb-is__sr" aria-live="polite">{{ announcement() }}</span>
  `,
  styleUrl: './infinite-scroll.component.css',
})
export class CbInfiniteScroll {
  protected readonly t = injectCbTranslation();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** Hay una carga en curso (muestra el indicador y evita pedir otra). */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Quedan elementos por cargar. */
  readonly hasMore = input(true, { transform: booleanAttribute });
  /** La última carga falló: muestra el aviso y "Reintentar". */
  readonly error = input(false, { transform: booleanAttribute });
  /** Número de elementos ya cargados: para anunciar cuántos llegaron y enfocar el primero nuevo. */
  readonly count = input<number | undefined>(undefined);
  /** Carga automática al llegar al final o solo con el botón. */
  readonly mode = input<CbInfiniteScrollMode>('auto');
  /** Cargas automáticas seguidas antes de pasar al botón (0 = sin límite). */
  readonly autoLimit = input(3, { transform: numberAttribute });
  /** Distancia al final a la que se empieza a cargar (margen del IntersectionObserver). */
  readonly threshold = input<string>('200px');
  /** El propio componente hace scroll, con este alto máximo (si no, se usa la página). */
  readonly scrollable = input(false, { transform: booleanAttribute });
  readonly height = input<string>('24rem');
  /** Elementos de la lista, para llevar el foco al primero nuevo tras "Cargar más". */
  readonly itemSelector = input<string>('li, [role="listitem"], article');
  /** Mensaje al llegar al final (con `showEnd`). */
  readonly showEnd = input(true, { transform: booleanAttribute });
  readonly endMessage = input<string | undefined>(undefined);
  readonly errorMessage = input<string | undefined>(undefined);
  readonly loadMoreLabel = input<string | undefined>(undefined);

  /** Pide la siguiente página. */
  readonly loadMore = output<CbLoadMoreSource>();

  protected readonly announcement = signal('');
  /** Cargas automáticas desde la última con el botón. */
  private readonly autoCount = signal(0);
  protected readonly showButton = computed(
    () => this.mode() === 'button' || (this.autoLimit() > 0 && this.autoCount() >= this.autoLimit()) || !this.observerSupported,
  );

  private readonly sentinel = viewChild.required<ElementRef<HTMLElement>>('sentinel');
  private readonly observerSupported = typeof IntersectionObserver !== 'undefined';
  /** Cuántos había al pedir la carga y si la pidió el botón (para el anuncio y el foco). */
  private pending: { count: number | undefined; source: CbLoadMoreSource } | null = null;
  private visible = false;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!this.observerSupported) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          this.visible = entry.isIntersecting;
          if (this.visible) this.tryAuto();
        },
        { root: this.scrollable() ? this.host.nativeElement : null, rootMargin: `0px 0px ${this.threshold()} 0px` },
      );
      observer.observe(this.sentinel().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });

    // Fin de una carga: anuncio, foco al primer elemento nuevo (si la pidió el botón) y, si el
    // final sigue a la vista (pocos elementos), se pide otra.
    // Una carga termina cuando `loading` vuelve a false, o —si la app carga de forma síncrona y
    // `loading` no llega a verse en true— cuando cambia `count` o se activa `error`.
    let wasLoading = false;
    effect(() => {
      const loading = this.loading();
      const count = this.count();
      const error = this.error();
      untracked(() => {
        if (loading) {
          if (!wasLoading) this.announce(this.t().infiniteLoading);
          wasLoading = true;
          return;
        }
        const pending = this.pending;
        const done = wasLoading || (pending !== null && (count !== pending.count || error));
        wasLoading = false;
        if (!done) return;
        this.pending = null;
        if (this.error()) {
          this.announce(this.errorMessage() ?? this.t().infiniteError);
          return;
        }
        const now = this.count();
        if (pending?.count !== undefined && now !== undefined && now > pending.count) {
          this.announce(cbFormat(this.t().infiniteLoaded, now - pending.count, now));
          if (pending.source !== 'scroll') this.focusItem(pending.count);
        } else if (!this.hasMore()) {
          this.announce(this.endMessage() ?? this.t().infiniteEnd);
        }
        afterNextRender(() => this.tryAuto(), { injector: this.injector });
      });
    });
  }

  /** Vuelve a permitir cargas automáticas (p. ej. al cambiar un filtro y reiniciar la lista). */
  reset(): void {
    this.autoCount.set(0);
    this.pending = null;
  }

  protected request(source: CbLoadMoreSource): void {
    if (this.loading()) return;
    // Con el botón, se vuelve a contar desde cero el límite de cargas automáticas.
    if (source !== 'scroll') this.autoCount.set(0);
    this.pending = { count: this.count(), source };
    this.loadMore.emit(source);
  }

  private tryAuto(): void {
    if (!this.visible || this.mode() !== 'auto' || this.loading() || this.error() || !this.hasMore() || this.pending) return;
    if (this.autoLimit() > 0 && this.autoCount() >= this.autoLimit()) return;
    this.autoCount.update((n) => n + 1);
    this.request('scroll');
  }

  private focusItem(index: number): void {
    afterNextRender(
      () => {
        const items = this.host.nativeElement.querySelectorAll<HTMLElement>(this.itemSelector());
        const target = items[index];
        if (!target) return;
        // Un elemento de lista no es enfocable: se le da tabindex -1 para poder llevar el foco.
        if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) target.setAttribute('tabindex', '-1');
        target.focus();
      },
      { injector: this.injector },
    );
  }

  /** Un espacio duro alterno hace que el mismo texto cuente como cambio y se vuelva a anunciar. */
  private announce(text: string): void {
    this.announceFlip = !this.announceFlip;
    this.announcement.set(this.announceFlip ? text : `${text} `);
  }
  private announceFlip = false;
}
