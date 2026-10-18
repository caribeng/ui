import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

@Component({
  selector: 'cb-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    class: 'cb-button-group',
    role: 'group',
    '[attr.aria-label]': 'ariaLabel()',
  },
  template: `
    <div
      class="cb-caribe-surface"
      [style.flexDirection]="orientation() === 'vertical' ? 'column' : 'row'"
      style="padding: 0.25rem; gap: 0.25rem"
    >
      <ng-content />
    </div>
  `,
  styleUrl: './button-group.component.css',
})
export class CbButtonGroupComponent {
  readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  readonly ariaLabel = input<string>('Grupo de acciones');
}
