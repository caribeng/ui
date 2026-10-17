import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbDataViewComponent } from '@caribeng/ui/dataview';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-dataview-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[CbDataViewComponent,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Data" title="Dataview" lead="Componente Dataview de CaribeNG." />
<doc-section id="import" title="Import">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Basic" [code]="example"><div style="width:100%"><cb-dataview [value]="items" /></div></doc-section>`})
export class DataviewDocComponent { constructor(){inject(TocService).reset();} protected readonly example=`<cb-dataview [value]="items" />`; protected items = [{id: 1, title: 'Card Caribe', description: 'Vista adaptable', category: 'UI'}]; }
