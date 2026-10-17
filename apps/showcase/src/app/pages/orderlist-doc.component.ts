import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { signal } from '@angular/core';
import { CbOrderListComponent } from '@caribeng/ui/orderlist';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-orderlist-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[CbOrderListComponent,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Data" title="Orderlist" lead="Componente Orderlist de CaribeNG." />
<doc-section id="import" title="Import">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Basic" [code]="example"><div style="width:100%"><cb-orderlist [(value)]="items" /></div></doc-section>`})
export class OrderlistDocComponent { constructor(){inject(TocService).reset();} protected readonly example=`<cb-orderlist [(value)]="items" />`; protected items = signal(['Uno', 'Dos', 'Tres']); }
