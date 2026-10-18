import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CbTree } from '@caribeng/ui/tree';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-tree-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[CbTree,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Data" title="Tree" lead="Componente Tree de CaribeNG." />
<doc-section id="import" title="Import">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Basic" [code]="example"><div style="width:100%"><cb-tree [value]="nodes" /></div></doc-section>`})
export class TreeDocComponent { constructor(){inject(TocService).reset();} protected readonly example=`<cb-tree [value]="nodes" />`; protected nodes = [{key: 'root', label: 'Documentos', children: [{key: 'guide', label: 'Gu?a'}]}]; }
