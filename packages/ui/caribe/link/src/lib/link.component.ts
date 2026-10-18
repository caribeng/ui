import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'cb-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { class: 'cb-link' },
  template: `
    <a
      [attr.href]="disabled() ? null : href()"
      [attr.target]="external() ? '_blank' : null"
      [attr.rel]="external() ? 'noopener noreferrer' : null"
      [attr.aria-disabled]="disabled()"
      style="color: var(--cb-color-primary-600, #059669); font-weight: 500; text-decoration: underline; text-underline-offset: 3px; cursor: pointer"
    >
      {{ label() }}<ng-content />
    </a>
  `,
  styleUrl: './link.component.css',
})
export class CbLink {
  readonly href = input<string>('#');
  readonly label = input<string>('');
  readonly external = input<boolean>(false);
  readonly disabled = input<boolean>(false);
}
