import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  model,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { injectCbTranslation } from '@caribeng/ui';

/**
 * Inplace de CaribeNG: alterna entre una vista previa (`[cb-inplace-display]`)
 * y el contenido editable o completo (`[cb-inplace-content]`) al hacer clic.
 */
@Component({
  selector: 'cb-inplace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-inplace',
    '[class.cb-is-active]': 'active()',
    '(keydown.escape)': 'closable() && active() && close()',
  },
  template: `
    @if (!active()) {
      <button
        type="button"
        class="cb-inplace__display"
        [disabled]="disabled()"
        (click)="open()"
      >
        <ng-content select="[cb-inplace-display]" />
      </button>
    } @else {
      <div class="cb-inplace__content">
        <ng-content select="[cb-inplace-content]" />
        @if (closable()) {
          <button
            type="button"
            class="cb-inplace__close"
            [attr.aria-label]="t().closeEditing"
            (click)="close()"
          >
            <cb-icon name="x" [size]="15" aria-hidden="true" />
          </button>
        }
      </div>
    }
  `,
  styleUrl: './inplace.component.css',
})
export class CbInplace {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly closable = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly active = model<boolean>(false);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** Muestra el contenido y mueve el foco a su primer elemento enfocable. */
  open(): void {
    if (this.disabled()) return;
    this.active.set(true);
    this.focusAfterRender('.cb-inplace__content :is(input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"]))');
  }

  /** Vuelve a la vista previa y devuelve el foco a ella. */
  close(): void {
    this.active.set(false);
    this.focusAfterRender('.cb-inplace__display');
  }

  private focusAfterRender(selector: string): void {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus(), {
      injector: this.injector,
    });
  }
}
