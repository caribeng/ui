import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { signal } from '@angular/core';
import { CbOrderList } from '@caribeng/ui/orderlist';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-orderlist-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[DocPlaygroundComponent, CbOrderList,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Data" title="Orderlist" lead="Componente Orderlist de CaribeNG." />
<doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Basic" [code]="example"><div style="width:100%"><cb-orderlist [(value)]="items" /></div></doc-section>`})
export class OrderlistDocComponent {
  protected readonly docApi = DOC_API['cb-orderlist'];
 constructor(){inject(TocService).reset();} protected readonly example=`<cb-orderlist [(value)]="items" />`; protected items = signal(['Uno', 'Dos', 'Tres']); }
