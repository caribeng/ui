import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';

@Component({ selector: 'cb-transaction-status', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.Emulated, template: `<div class="cb-surface cb-row cb-status--{{status()}}" role="status"><strong aria-hidden="true">{{status()==='success'?'?':status()==='error'?'?':status()==='warning'?'!':'i'}}</strong><span>{{label()}}</span></div>`, styleUrl: './transaction-status.component.css' })
export class CbTransactionStatusComponent {
readonly status=input<'success'|'warning'|'error'|'info'>('success'); readonly label=input('Transacci?n completada');
}
