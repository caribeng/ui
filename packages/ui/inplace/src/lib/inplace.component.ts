import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
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

  open(): void {
    if (!this.disabled()) this.active.set(true);
  }

  close(): void {
    this.active.set(false);
  }
}
