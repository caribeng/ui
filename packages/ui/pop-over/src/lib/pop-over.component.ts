import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';

@Component({ selector: 'cb-pop-over', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.Emulated, template: `<div class="cb-column"><button type="button" aria-expanded="{{visible()}}" (click)="visible.update(v=>!v)">{{triggerLabel()}}</button>@if (visible()) {<section class="cb-surface" role="dialog"><button type="button" aria-label="Cerrar" (click)="visible.set(false)">&times;</button><ng-content /></section>}</div>`, styleUrl: './pop-over.component.css' })
export class CbPopOverComponent {
readonly triggerLabel=input('Mostrar informaci?n'); readonly visible=model(false);
}
