import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model, output } from '@angular/core';

@Component({ selector: 'cb-data-table', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.Emulated, template: `<div class="cb-surface"><table style="width:100%;border-collapse:collapse"><thead><tr>@for (col of columns(); track col) {<th style="text-align:left;padding:.6rem;border-bottom:1px solid var(--cb-border-color,#d7dce5)">{{col}}</th>}</tr></thead><tbody>@for (row of rows(); track $index) {<tr>@for (col of columns(); track col) {<td style="padding:.6rem;border-bottom:1px solid var(--cb-border-color,#d7dce5)">{{row[col]}}</td>}</tr>} @empty {<tr><td [attr.colspan]="columns().length">{{emptyMessage()}}</td></tr>}</tbody></table></div>`, styleUrl: './data-table.component.css' })
export class CbDataTableComponent {
readonly columns=input<readonly string[]>([]); readonly rows=input<readonly Record<string,unknown>[]>([]); readonly emptyMessage=input('No hay datos');
}
