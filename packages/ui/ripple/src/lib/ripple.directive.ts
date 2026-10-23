import {
  Directive,
  ElementRef,
  Renderer2,
  inject,
  input,
} from '@angular/core';

/**
 * Ripple (`[cbRipple]`) de CaribeNG: directiva que añade retroalimentación
 * táctil en forma de onda al hacer clic sobre botones, tarjetas o contenedores.
 */
@Directive({
  selector: '[cbRipple]',
  host: {
    class: 'cb-ripple-host',
    '[style.position]': '"relative"',
    '[style.overflow]': '"hidden"',
    '(pointerdown)': 'onPointerDown($event)',
  },
})
export class CbRippleDirective {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  readonly cbRippleDisabled = input<boolean>(false);

  protected onPointerDown(event: PointerEvent): void {
    if (this.cbRippleDisabled()) return;
    if (this.hostRef.nativeElement.ownerDocument.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const host = this.hostRef.nativeElement;
    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height, 48);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ink = this.renderer.createElement('span') as HTMLSpanElement;
    this.renderer.addClass(ink, 'cb-ripple-ink');
    this.renderer.setStyle(ink, 'position', 'absolute');
    this.renderer.setStyle(ink, 'width', `${size}px`);
    this.renderer.setStyle(ink, 'height', `${size}px`);
    this.renderer.setStyle(ink, 'left', `${x}px`);
    this.renderer.setStyle(ink, 'top', `${y}px`);
    this.renderer.setStyle(ink, 'borderRadius', '999px');
    this.renderer.setStyle(ink, 'background', 'currentColor');
    this.renderer.setStyle(ink, 'opacity', '0.18');
    this.renderer.setStyle(ink, 'pointerEvents', 'none');
    this.renderer.setStyle(ink, 'transform', 'scale(0)');
    this.renderer.setStyle(ink, 'transition', 'transform 320ms ease-out, opacity 320ms ease-out');

    this.renderer.appendChild(host, ink);

    requestAnimationFrame(() => {
      this.renderer.setStyle(ink, 'transform', 'scale(2)');
      this.renderer.setStyle(ink, 'opacity', '0');
    });

    setTimeout(() => {
      if (ink.parentNode === host) {
        this.renderer.removeChild(host, ink);
      }
    }, 340);
  }
}
