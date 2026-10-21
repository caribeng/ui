import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterEveryRender,
  inject,
  input,
  signal,
} from '@angular/core';

export type CbFloatLabelVariant = 'over' | 'in' | 'on';

/**
 * FloatLabel de CaribeNG: contenedor que eleva visualmente la etiqueta `<label>`
 * proyectada cuando el campo interno recibe foco o tiene contenido.
 */
@Component({
  selector: 'cb-float-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'cb-float-label',
    '[class.cb-float-label--over]': 'variant() === "over"',
    '[class.cb-float-label--in]': 'variant() === "in"',
    '[class.cb-float-label--on]': 'variant() === "on"',
    '[class.cb-is-active]': 'focused() || filled()',
    '(focusin)': 'onFocusIn()',
    '(focusout)': 'onFocusOut()',
    '(input)': 'checkFilled()',
    '(change)': 'checkFilled()',
  },
  template: `<ng-content />`,
  styleUrl: './floatlabel.component.css',
})
export class CbFloatLabel {
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly variant = input<CbFloatLabelVariant>('on');

  readonly focused = signal(false);
  readonly filled = signal(false);

  constructor() {
    // Tras cada render: detecta también valores asignados por código (p. ej. `patchValue`),
    // que no disparan los eventos `input` / `change`.
    afterEveryRender(() => {
      this.checkFilled();
    });
  }

  protected onFocusIn(): void {
    this.focused.set(true);
  }

  protected onFocusOut(): void {
    this.focused.set(false);
    this.checkFilled();
  }

  checkFilled(): void {
    const inputEl = this.hostRef.nativeElement.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      'input, textarea',
    );
    this.filled.set(Boolean(inputEl && inputEl.value.trim().length > 0));
  }
}
