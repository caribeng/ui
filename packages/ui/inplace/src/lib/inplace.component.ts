import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  model,
} from '@angular/core';
import { CbIconComponent } from '@caribeng/ui/icon';

/**
 * Inplace de CaribeNG: alterna entre una vista previa (`[cb-inplace-display]`)
 * y el contenido editable o completo (`[cb-inplace-content]`) al hacer clic.
 */
@Component({
  selector: 'cb-inplace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIconComponent],
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
            aria-label="Cerrar edición"
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
export class CbInplaceComponent {
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
