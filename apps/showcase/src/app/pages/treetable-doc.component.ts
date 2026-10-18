import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocPlaygroundComponent } from '../components/doc-playground.component';
import { DOC_API } from '../components/doc-api-registry';
import { CbTreeTable } from '@caribeng/ui/treetable';
import { DocSectionComponent } from '../shared/doc-section.component';
import { DocPageHeaderComponent } from '../shared/page-header.component';
import { TocService } from '../services/toc.service';
@Component({selector:'doc-treetable-page',changeDetection:ChangeDetectionStrategy.OnPush,imports:[DocPlaygroundComponent, CbTreeTable,DocSectionComponent,DocPageHeaderComponent],template:`
<doc-page-header eyebrow="Data" title="Treetable" lead="Componente Treetable de CaribeNG." />
<doc-playground [api]="docApi" />

    <doc-section id="import" title="Import">Consulta el entry point del componente en @caribeng/ui.</doc-section>
<doc-section id="basic" title="Basic" [code]="example"><div style="width:100%"><cb-treetable [value]="nodes" [columns]="columns" /></div></doc-section>`})
export class TreetableDocComponent {
  protected readonly docApi = DOC_API['cb-treetable'];
 constructor(){inject(TocService).reset();} protected readonly example=`<cb-treetable [value]="nodes" [columns]="columns" />`; protected columns = [{field: 'name', header: 'Nombre'}]; nodes = [{key: '1', data: {name: 'Ra?z'}, children: []}]; }
