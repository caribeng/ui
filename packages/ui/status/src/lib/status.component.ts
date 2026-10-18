import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';

@Component({ selector: 'cb-status', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.Emulated, template: `<span class="cb-surface cb-status--{{status()}}" role="status"><ng-content>{{text()}}</ng-content></span>`, styleUrl: './status.component.css' })
export class CbStatusComponent {
readonly text=input(''); readonly status=input<'success'|'warning'|'error'|'info'>('info');
}
