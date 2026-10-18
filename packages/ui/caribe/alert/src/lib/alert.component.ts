import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';

@Component({ selector: 'cb-alert', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.Emulated, template: `@if (visible()) { <section class="cb-surface cb-status--{{severity()}}" role="alert"><div class="cb-row"><strong>{{title()}}</strong>@if (closable()) {<button type="button" aria-label="Cerrar" (click)="close()">&times;</button>}</div><div><ng-content /></div></section> }`, styleUrl: './alert.component.css' })
export class CbAlert {
readonly title = input(''); readonly severity = input<'success'|'warning'|'error'|'info'>('info'); readonly closable = input(true); readonly visible = model(true); readonly closed = output<void>(); protected close(){this.visible.set(false);this.closed.emit();}
}
