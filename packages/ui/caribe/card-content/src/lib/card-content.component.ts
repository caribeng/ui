import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';

@Component({ selector: 'cb-card-content', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.Emulated, template: `<article class="cb-surface cb-column"><header><strong>{{title()}}</strong><div class="cb-muted">{{subtitle()}}</div></header><p><ng-content /></p><footer class="cb-actions"><button type="button" (click)="action.emit()">{{actionLabel()}}</button></footer></article>`, styleUrl: './card-content.component.css' })
export class CbCardContent {
readonly title=input(''); readonly subtitle=input(''); readonly actionLabel=input('Ver detalle'); readonly action=output<void>();
}
