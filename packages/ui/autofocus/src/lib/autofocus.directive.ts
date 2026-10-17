import { AfterViewInit, Directive, ElementRef, booleanAttribute, inject, input } from '@angular/core';

/**
 * Directiva AutoFocus de CaribeNG (`[cbAutoFocus]`):
 * enfoca automáticamente el elemento anfitrión al montarse en la vista cuando está habilitada.
 */
@Directive({
  selector: '[cbAutoFocus]',
})
export class CbAutoFocusDirective implements AfterViewInit {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly cbAutoFocus = input<boolean, unknown>(true, {
    transform: (val) => (val === '' ? true : booleanAttribute(val)),
  });

  ngAfterViewInit(): void {
    if (this.cbAutoFocus()) {
      queueMicrotask(() => {
        this.host.nativeElement.focus?.();
      });
    }
  }
}
