import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';

@Component({ selector: 'cb-card-primary', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.Emulated, template: `<article class="cb-surface cb-column"><div class="cb-row"><span aria-hidden="true">*</span><strong>{{title()}}</strong></div><span class="cb-muted">{{subtitle()}}</span><strong>{{value()}}</strong><ng-content /></article>`, styleUrl: './card-primary.component.css' })
export class CbCardPrimary {
readonly title=input(''); readonly subtitle=input(''); readonly value=input('');
}
