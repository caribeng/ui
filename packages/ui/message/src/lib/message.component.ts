import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';
import { injectCbTranslation, type CbSeverity } from '@caribeng/ui';

const SEVERITY_ICON: Record<string, string> = {
  success: 'circle-check',
  info: 'info',
  warning: 'triangle-alert',
  danger: 'circle-x',
  help: 'info',
  primary: 'info',
  secondary: 'info',
  contrast: 'info',
};

/**
 * Message de CaribeNG: mensaje inline con severidad, icono y cierre opcional.
 *
 * @example
 * ```html
 * <cb-message severity="success">Guardado correctamente.</cb-message>
 * <cb-message severity="warning" closable>Revisa los campos.</cb-message>
 * ```
 */
@Component({
  selector: 'cb-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: { class: 'cb-message-host' },
  template: `
    @if (visible()) {
      <div class="cb-message" [class]="'cb-message--' + severity()" role="alert">
        @if (iconName()) {
          <cb-icon class="cb-message__icon" [name]="iconName()" [size]="18" aria-hidden="true" />
        }
        <div class="cb-message__content"><ng-content /></div>
        @if (closable()) {
          <button type="button" class="cb-message__close" [attr.aria-label]="t().close" (click)="close()">
            <cb-icon name="x" [size]="16" aria-hidden="true" />
          </button>
        }
      </div>
    }
  `,
  styleUrl: './message.component.css',
})
export class CbMessage {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
  readonly severity = input<CbSeverity>('info');
  /** Muestra el botón de cerrar. */
  readonly closable = input<boolean, unknown>(false, { transform: toBoolean });
  /** Icono (sobrescribe el de la severidad); `''` para ocultarlo. */
  readonly icon = input<string | null>(null);
  /** Visibilidad (two-way). */
  readonly visible = model<boolean>(true);

  /** Se emite al cerrar. */
  readonly closed = output<void>();

  protected readonly iconName = computed(() => {
    const override = this.icon();
    if (override !== null) return override;
    return SEVERITY_ICON[this.severity()] ?? 'info';
  });

  protected close(): void {
    this.visible.set(false);
    this.closed.emit();
  }
}

function toBoolean(value: unknown): boolean {
  return value !== false && value != null && `${value}` !== 'false';
}
