import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';

@Component({ selector: 'cb-card-select', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.Emulated, template: `<section class="cb-surface cb-column"><input type="search" [value]="query()" (input)="query.set($any($event.target).value)" aria-label="Buscar opciones" placeholder="Buscar"><div role="listbox" [attr.aria-label]="label()">@for (item of filtered(); track item) {<button type="button" role="option" [attr.aria-selected]="selected()===item" (click)="selected.set(item); selectionChange.emit(item)">{{item}}</button>} @empty {<span class="cb-muted">Sin resultados</span>}</div></section>`, styleUrl: './card-select.component.css' })
export class CbCardSelect {
readonly items=input<readonly string[]>([]); readonly label=input('Opciones'); readonly selected=model<string|null>(null); readonly selectionChange=output<string>(); protected readonly query=model(''); protected readonly filtered=computed(()=>this.items().filter(x=>x.toLocaleLowerCase().includes(this.query().toLocaleLowerCase())));
}
