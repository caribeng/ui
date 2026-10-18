import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbDataView } from '@caribeng/ui/dataview';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-dataview-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[DocPlaygroundComponent, CbDataView,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Data" title="Dataview" lead="Componente Dataview de CaribeNG." />
<doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Basic" [code]="example"><div style="width:100%"><cb-dataview [value]="items" /></div></doc-section>`})
export class DataviewDocComponent {
  protected readonly docApi = DOC_API['cb-dataview'];
 constructor(){inject(TocService).reset();} protected readonly example=`<cb-dataview [value]="items" />`; protected items = [{id: 1, title: 'Card Caribe', description: 'Vista adaptable', category: 'UI'}]; }
