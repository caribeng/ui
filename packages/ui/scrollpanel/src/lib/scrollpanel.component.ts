import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  input,
  viewChild,
} from '@angular/core';

/**
 * ScrollPanel de CaribeNG: contenedor de desplazamiento con barras estilizadas
 * mediante CSS tokens y soporte completo de teclado (`tabindex="0"`, `role="region"`).
 *
 * @example
 * ```html
 * <cb-scroll-panel height="200px" ariaLabel="Términos del servicio">
 *   <p>Contenido extenso…</p>
 * </cb-scroll-panel>
 * ```
 */
@Component({
  selector: 'cb-scroll-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-scroll-panel',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
  },
  template: `
    <div
      #viewport
      class="cb-scroll-panel__viewport"
      role="region"
      tabindex="0"
      [attr.aria-label]="ariaLabel() || 'Área desplazable'"
    >
      <div class="cb-scroll-panel__content">
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './scrollpanel.component.css',
})
export class CbScrollPanelComponent {
  /** Ancho CSS del contenedor (ej. `'100%'`, `'320px'`). */
  readonly width = input<string>('100%');
  /** Alto CSS del contenedor (ej. `'200px'`). */
  readonly height = input<string>('200px');
  /** Etiqueta accesible para la región con scroll. */
  readonly ariaLabel = input<string>('Área desplazable');

  private readonly viewportRef = viewChild<ElementRef<HTMLElement>>('viewport');

  /** Desplaza el contenido a la posición indicada. */
  scrollTop(top: number): void {
    const el = this.viewportRef()?.nativeElement;
    if (!el) return;
    el.scrollTop = top;
  }
}
