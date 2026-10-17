import { Directive, ElementRef, inject, input } from '@angular/core';

/**
 * Directiva StyleClass de CaribeNG (`[cbStyleClass]`):
 * alterna o aplica clases CSS sobre un elemento objetivo (`@next`, `@prev`, `@parent` o selector CSS)
 * sin necesidad de escribir lógica imperativa en el componente.
 */
@Directive({
  selector: '[cbStyleClass]',
  host: {
    '(click)': 'onTriggerClick()',
  },
})
export class CbStyleClassDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Selector del objetivo: `'@next'`, `'@prev'`, `'@parent'`, `'@grandparent'` o selector CSS. */
  readonly cbStyleClass = input<string>('@next');
  readonly toggleClass = input<string>('');
  readonly enterClass = input<string>('');
  readonly leaveClass = input<string>('');

  resolveTarget(): HTMLElement | null {
    const sel = (this.cbStyleClass() || '@next').trim();
    const el = this.host.nativeElement;
    if (sel === '@next') return el.nextElementSibling as HTMLElement | null;
    if (sel === '@prev') return el.previousElementSibling as HTMLElement | null;
    if (sel === '@parent') return el.parentElement;
    if (sel === '@grandparent') return el.parentElement?.parentElement ?? null;
    return document.querySelector<HTMLElement>(sel);
  }

  protected onTriggerClick(): void {
    const target = this.resolveTarget();
    if (!target) return;

    const toggle = this.toggleClass().trim();
    if (toggle) {
      for (const cls of toggle.split(/\s+/)) {
        target.classList.toggle(cls);
      }
      return;
    }

    const enter = this.enterClass().trim();
    const leave = this.leaveClass().trim();
    if (enter && !target.classList.contains(enter.split(/\s+/)[0])) {
      if (leave) target.classList.remove(...leave.split(/\s+/));
      target.classList.add(...enter.split(/\s+/));
    } else if (leave) {
      if (enter) target.classList.remove(...enter.split(/\s+/));
      target.classList.add(...leave.split(/\s+/));
    }
  }
}
