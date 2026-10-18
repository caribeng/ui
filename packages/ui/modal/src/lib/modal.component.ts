import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';

@Component({ selector: 'cb-modal', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.Emulated, template: `@if (visible()) {<div class="cb-surface" role="dialog" aria-modal="true" [attr.aria-label]="title()"><header class="cb-row"><h2>{{title()}}</h2><button type="button" aria-label="Cerrar" (click)="close()">&times;</button></header><div><ng-content /></div><footer class="cb-actions"><button type="button" (click)="close()">Cancelar</button><button class="cb-primary" type="button" (click)="confirm.emit()">{{confirmLabel()}}</button></footer></div>}`, styleUrl: './modal.component.css' })
export class CbModalComponent {
readonly title=input(''); readonly confirmLabel=input('Aceptar'); readonly visible=model(false); readonly confirm=output<void>(); readonly closed=output<void>(); protected close(){this.visible.set(false);this.closed.emit();}
}
