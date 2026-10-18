import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';

/**
 * Footer de Caribe Design: pie de página con texto de copyright y una zona de
 * enlaces o acciones proyectadas.
 *
 * @example
 * ```html
 * <cb-footer><a href="#">Privacidad</a><a href="#">Términos</a></cb-footer>
 * ```
 */
@Component({
  selector: 'cb-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-footer-host' },
  template: `
    <footer class="cb-footer">
      <span class="cb-footer__copy">{{ copyright() }}</span>
      <div class="cb-footer__links">
        <ng-content />
      </div>
    </footer>
  `,
  styleUrl: './footer.component.css',
})
export class CbFooter {
  /** Texto de copyright. */
  readonly copyright = input<string>(
    '© 2026 CaribeNG Design System. Todos los derechos reservados.',
  );
}
