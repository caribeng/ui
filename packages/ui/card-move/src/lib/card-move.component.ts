import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';

@Component({ selector: 'cb-card-move', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.Emulated, template: `<section class="cb-surface"><ul class="cb-list">@for (item of items(); track $index) {<li class="cb-row"><span>{{item}}</span><span class="cb-actions"><button type="button" aria-label="Mover arriba" [disabled]="$first" (click)="move($index,-1)">&times;</button><button type="button" aria-label="Mover abajo" [disabled]="$last" (click)="move($index,1)">&times;</button></span></li>}</ul></section>`, styleUrl: './card-move.component.css' })
export class CbCardMoveComponent {
readonly items=model<readonly string[]>([]); protected move(index:number,delta:number){const next=[...this.items()];const target=index+delta;if(target<0||target>=next.length)return;[next[index],next[target]]=[next[target],next[index]];this.items.set(next);}
}
