import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

/**
 * BlockUI de CaribeNG: bloquea la interacción sobre el contenido proyectado
 * mostrando una máscara semitransparente con indicador opcional (`aria-busy`).
 */
@Component({
  selector: 'cb-block-ui',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-block-ui',
    '[class.cb-is-blocked]': 'blocked()',
    '[attr.aria-busy]': 'blocked()',
  },
  template: `
    <div class="cb-block-ui__content" [attr.inert]="blocked() ? '' : null">
      <ng-content />
    </div>
    @if (blocked()) {
      <div class="cb-block-ui__mask" role="status" aria-live="polite">
        <cb-icon name="loader" [size]="22" [spin]="true" aria-hidden="true" />
      </div>
    }
  `,
  styleUrl: './blockui.component.css',
})
export class CbBlockUi {
  readonly blocked = input<boolean>(false);
}
