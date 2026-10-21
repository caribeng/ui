import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { injectCbTranslation } from '@caribeng/ui';

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
        <span class="cb-block-ui__sr">{{ message() ?? t().loading }}</span>
      </div>
    }
  `,
  styleUrl: './blockui.component.css',
})
export class CbBlockUi {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly blocked = input<boolean>(false);
  /** Texto que anuncia el lector de pantalla al bloquear. Por defecto, "Cargando" del idioma activo. */
  readonly message = input<string | undefined>(undefined);
}
