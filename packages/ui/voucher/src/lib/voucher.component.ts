import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';

@Component({ selector: 'cb-voucher', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.Emulated, template: `<article class="cb-surface cb-column"><h2>{{title()}}</h2><ng-content /><dl class="cb-list">@for (row of rows(); track row.label) {<li class="cb-row"><dt class="cb-muted">{{row.label}}</dt><dd>{{row.value}}</dd></li>}</dl><div class="cb-actions"><button type="button" (click)="copy.emit()">{{actionLabel()}}</button></div></article>`, styleUrl: './voucher.component.css' })
export class CbVoucherComponent {
readonly title=input('Comprobante'); readonly rows=input<readonly {label:string;value:string}[]>([]); readonly actionLabel=input('Compartir'); readonly copy=output<void>();
}
