import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { CbIcon } from '@caribeng/ui/icon';

export type CbInlineMessageSeverity = 'info' | 'success' | 'warn' | 'danger';

/**
 * InlineMessage de CaribeNG: indicador compacto de validación o estado en línea.
 */
@Component({
  selector: 'cb-inline-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CbIcon],
  host: {
    class: 'cb-inline-message',
    '[attr.role]': 'severity() === "danger" || severity() === "warn" ? "alert" : "status"',
    '[class.cb-inline-message--info]': 'severity() === "info"',
    '[class.cb-inline-message--success]': 'severity() === "success"',
    '[class.cb-inline-message--warn]': 'severity() === "warn"',
    '[class.cb-inline-message--danger]': 'severity() === "danger"',
  },
  template: `
    <cb-icon [name]="iconName()" [size]="15" aria-hidden="true" />
    <span class="cb-inline-message__text">{{ text() }}<ng-content /></span>
  `,
  styleUrl: './inlinemessage.component.css',
})
export class CbInlineMessage {
  readonly severity = input<CbInlineMessageSeverity>('info');
  readonly text = input<string>('');

  protected readonly iconName = computed(() => {
    switch (this.severity()) {
      case 'success':
        return 'circle-check';
      case 'warn':
        return 'triangle-alert';
      case 'danger':
        return 'circle-x';
      default:
        return 'info';
    }
  });
}
