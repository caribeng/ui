import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';

@Component({ selector: 'cb-inline-alert', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.Emulated, template: `@if (visible()) { <div class="cb-surface cb-row cb-status--{{status()}}" role="status"><span aria-hidden="true">{{status() === 'success' ? 'S' : status() === 'error' ? '!' : 'i'}}</span><div class="cb-column"><strong>{{title()}}</strong><span><ng-content /></span></div>@if (closable()) {<button type="button" aria-label="Cerrar" (click)="close()">&times;</button>}</div> }`, styleUrl: './inline-alert.component.css' })
export class CbInlineAlertComponent {
readonly title=input(''); readonly status=input<'success'|'warning'|'error'|'info'>('info'); readonly closable=input(true); readonly visible=model(true); readonly closed=output<void>(); protected close(){this.visible.set(false);this.closed.emit();}
}
