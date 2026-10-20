import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { injectCbTranslation } from '@caribeng/ui';
export interface CbDataViewItem { id: string | number; title: string; description?: string; category?: string }
@Component({ selector: 'cb-dataview', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="cb-dataview" [attr.data-layout]="layout()" role="list">@for (item of value(); track item.id) {<article role="listitem" class="cb-dataview__item"><strong>{{item.title}}</strong>@if(item.category){<small>{{item.category}}</small>}@if(item.description){<p>{{item.description}}</p>}<button type="button" (click)="selection.set(item)" [attr.aria-pressed]="selection()?.id===item.id">{{ t().select }}</button></article>} @empty {<p>{{(emptyMessage() ?? t().noResults)}}</p>}</div>`,
  styles: [`:host{display:block}.cb-dataview{display:grid;gap:1rem}.cb-dataview[data-layout="grid"]{grid-template-columns:repeat(auto-fit,minmax(12rem,1fr))}.cb-dataview__item{padding:1rem;border:1px solid var(--cb-color-border,#d1d5db);border-radius:var(--cb-border-radius,0.5rem);background:var(--cb-color-surface,#fff);color:var(--cb-color-text,#111827)}small{display:block;color:var(--cb-color-text-muted,#6b7280)}p{margin:.5rem 0}`] })
export class CbDataView {
  /** Textos de interfaz en el idioma activo (`provideCaribeNG({ locale })`). */
  protected readonly t = injectCbTranslation();
 readonly value=input<readonly CbDataViewItem[]>([]); readonly layout=model<'grid'|'list'>('grid'); readonly selection=model<CbDataViewItem|null>(null); readonly emptyMessage=input<string | undefined>(undefined); }
