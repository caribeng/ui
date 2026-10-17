import { Directive, ElementRef, inject, input } from '@angular/core';

const FOCUSABLE_SELECTOR = [
  'a[href]:not([disabled])',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(',');

/**
 * Directiva FocusTrap de CaribeNG (`[cbFocusTrap]`):
 * mantiene el ciclo de foco por teclado (Tab / Shift+Tab) dentro del contenedor anfitrión.
 */
@Directive({
  selector: '[cbFocusTrap]',
  host: {
    class: 'cb-focus-trap',
    '[class.cb-is-disabled]': 'cbFocusTrapDisabled()',
    '(keydown)': 'onKeydown($event)',
  },
})
export class CbFocusTrapDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly cbFocusTrapDisabled = input<boolean>(false);

  getFocusableElements(): HTMLElement[] {
    return Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    );
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.cbFocusTrapDisabled() || event.key !== 'Tab') return;
    const focusables = this.getFocusableElements();
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (active === first || !this.host.nativeElement.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || !this.host.nativeElement.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  }
}
