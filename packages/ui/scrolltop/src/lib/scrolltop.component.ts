import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { injectCbTranslation } from '@caribeng/ui';

export type CbScrollTopTarget = 'window' | 'parent';

/**
 * ScrollTop de CaribeNG: botón flotante que aparece cuando el usuario supera
 * un umbral de desplazamiento (`threshold`) en la ventana o en el contenedor padre,
 * permitiendo volver al inicio con un clic.
 *
 * @example
 * ```html
 * <cb-scroll-top [threshold]="200" />
 * <div style="height: 200px; overflow: auto; position: relative">
 *   <p>Contenido largo…</p>
 *   <cb-scroll-top target="parent" [threshold]="80" />
 * </div>
 * ```
 */
@Component({
  selector: 'cb-scroll-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-scroll-top',
    '[class.cb-scroll-top--parent]': 'target() === "parent"',
    '[class.cb-scroll-top--window]': 'target() === "window"',
  },
  template: `
    @if (visible()) {
      <button
        type="button"
        class="cb-scroll-top__button"
        [attr.aria-label]="(ariaLabel() ?? t().scrollTop)"
        (click)="scrollToTop()"
      >
        <cb-icon [name]="icon()" [size]="18" aria-hidden="true" />
      </button>
    }
  `,
  styleUrl: './scrolltop.component.css',
})
export class CbScrollTop {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  private readonly doc = inject(DOCUMENT);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Elemento cuyo desplazamiento se escucha: `'window'` o `'parent'`. */
  readonly target = input<CbScrollTopTarget>('window');
  /** Píxeles desplazados a partir de los cuales se muestra el botón. */
  readonly threshold = input<number>(200);
  /** Comportamiento del scroll al volver arriba. */
  readonly behavior = input<ScrollBehavior>('smooth');
  /** Nombre del icono de `<cb-icon>`. */
  readonly icon = input<string>('chevron-up');
  /** Etiqueta accesible para el botón. */
  readonly ariaLabel = input<string | undefined>(undefined);

  readonly visible = signal<boolean>(false);

  private cleanupFn: (() => void) | null = null;

  constructor() {
    afterNextRender(() => {
      this.bindListener();
    });

    effect(() => {
      this.target();
      this.threshold();
      this.checkScroll();
    });

    this.destroyRef.onDestroy(() => {
      this.cleanupFn?.();
    });
  }

  private getParentTarget(): HTMLElement | null {
    const parent = this.hostRef.nativeElement.parentElement;
    if (!parent) return null;
    const viewport = parent.querySelector<HTMLElement>('.cb-scroll-panel__viewport');
    return viewport ?? parent;
  }

  private bindListener(): void {
    this.cleanupFn?.();
    const win = this.doc.defaultView;
    const onScroll = () => this.checkScroll();

    if (this.target() === 'parent') {
      const parentEl = this.getParentTarget();
      parentEl?.addEventListener('scroll', onScroll, { passive: true });
      this.cleanupFn = () => parentEl?.removeEventListener('scroll', onScroll);
    } else if (win) {
      win.addEventListener('scroll', onScroll, { passive: true });
      this.cleanupFn = () => win.removeEventListener('scroll', onScroll);
    }
    this.checkScroll();
  }

  checkScroll(): void {
    const limit = this.threshold();
    if (this.target() === 'parent') {
      const parentEl = this.getParentTarget();
      const top = parentEl ? parentEl.scrollTop : 0;
      this.visible.set(top >= limit);
    } else {
      const win = this.doc.defaultView;
      const top = win ? win.scrollY || this.doc.documentElement.scrollTop : 0;
      this.visible.set(top >= limit);
    }
  }

  scrollToTop(): void {
    // Con "reducir movimiento" en el sistema, el desplazamiento es instantáneo.
    const reduce = this.doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = reduce ? 'auto' : this.behavior();
    if (this.target() === 'parent') {
      const parentEl = this.getParentTarget();
      if (!parentEl) return;
      if (typeof parentEl.scrollTo === 'function') {
        parentEl.scrollTo({ top: 0, behavior });
      } else {
        parentEl.scrollTop = 0;
      }
      parentEl.scrollTop = 0;
      this.checkScroll();
    } else {
      const win = this.doc.defaultView;
      if (win && typeof win.scrollTo === 'function') {
        win.scrollTo({ top: 0, behavior });
      }
      this.doc.documentElement.scrollTop = 0;
      this.checkScroll();
    }
  }
}
