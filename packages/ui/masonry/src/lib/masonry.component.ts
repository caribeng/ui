import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

/** Alto de cada fila de la rejilla (px): cuanto menor, más exacto el ajuste de alturas. */
const ROW = 4;

/** Filas que ocupa un elemento de `height` px con un hueco de `gap` px debajo. */
export function masonrySpan(height: number, gap: number, row = ROW): number {
  return Math.max(1, Math.ceil((height + gap) / row));
}

/**
 * Masonry de CaribeNG: reparte los elementos proyectados en columnas de alturas distintas, sin
 * huecos, como un tablero de Pinterest. Usa CSS Grid y mide la altura de cada elemento (también
 * si cambia, p. ej. al cargar una imagen), así que el orden del DOM —el que siguen el teclado y
 * los lectores de pantalla— es el orden visual por filas, a diferencia de las columnas de CSS.
 *
 * @example
 * ```html
 * <cb-masonry minColumnWidth="14rem" gap="12px" role="list">
 *   @for (foto of fotos(); track foto.id) { <figure role="listitem">…</figure> }
 * </cb-masonry>
 * ```
 */
@Component({
  selector: 'cb-masonry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'cb-masonry',
    '[style.--cb-masonry-gap]': 'gap()',
    '[style.--cb-masonry-columns]': 'columns() > 0 ? "repeat(" + columns() + ", minmax(0, 1fr))" : "repeat(auto-fill, minmax(min(" + minColumnWidth() + ", 100%), 1fr))"',
  },
  template: `<ng-content />`,
  styleUrl: './masonry.component.css',
})
export class CbMasonry {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Número fijo de columnas (0 = las que quepan con `minColumnWidth`). */
  readonly columns = input(0, { transform: numberAttribute });
  /** Ancho mínimo de columna cuando `columns` es 0. */
  readonly minColumnWidth = input<string>('16rem');
  /** Separación entre elementos (cualquier longitud CSS). */
  readonly gap = input<string>('16px');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const host = this.host.nativeElement;
      const layout = () => {
        const gap = parseFloat(getComputedStyle(host).columnGap) || 0;
        for (const child of Array.from(host.children) as HTMLElement[]) {
          const span = `span ${masonrySpan(child.getBoundingClientRect().height, gap)}`;
          if (child.style.gridRowEnd !== span) child.style.gridRowEnd = span;
        }
      };
      let frame = 0;
      const schedule = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(layout);
      };
      layout();
      if (typeof ResizeObserver === 'undefined') return;
      // Cambia el alto de un elemento (imágenes que cargan, texto que se adapta) o el ancho de las
      // columnas (también al cambiar `gap`, `columns` o `minColumnWidth`).
      const resize = new ResizeObserver(schedule);
      resize.observe(host);
      const watch = (el: Element) => resize.observe(el);
      Array.from(host.children).forEach(watch);
      // Elementos que llegan o se van (p. ej. con scroll infinito).
      const mutations = new MutationObserver((records) => {
        for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && watch(n));
        schedule();
      });
      mutations.observe(host, { childList: true });
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        resize.disconnect();
        mutations.disconnect();
      });
    });
  }
}
