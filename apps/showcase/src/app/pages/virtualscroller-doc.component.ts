import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbVirtualScrollerComponent } from '@caribeng/ui/virtualscroller';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-virtualscroller-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[CbVirtualScrollerComponent,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Data" title="Virtualscroller" lead="Componente Virtualscroller de CaribeNG." />
<doc-section id="import" title="Import">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Basic" [code]="example"><div style="width:100%"><cb-virtualscroller [items]="items" /></div></doc-section>`})
export class VirtualscrollerDocComponent { constructor(){inject(TocService).reset();} protected readonly example=`<cb-virtualscroller [items]="items" />`; protected items = Array.from({length: 100}, (_, i) => `Fila ${i + 1}`); }
